param(
    [string]$DashboardScriptRoot = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$projectRoot = (Resolve-Path (Join-Path $DashboardScriptRoot '..\..')).Path
$dashboardRoot = Join-Path $projectRoot 'dashboard'
$pagesRoot = Join-Path $dashboardRoot 'pages'
$assetsRoot = Join-Path $dashboardRoot 'assets'

foreach ($directory in @($dashboardRoot, $pagesRoot, $assetsRoot)) {
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }
}

function Convert-InlineMarkdown {
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return '<span class="empty-value">미확인</span>'
    }

    $value = [System.Net.WebUtility]::HtmlEncode($Text.Trim())
    $value = [regex]::Replace($value, '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    $value = [regex]::Replace($value, '\*\*([^*]+)\*\*', '<strong>$1</strong>')
    $value = [regex]::Replace($value, '`([^`]+)`', '<code>$1</code>')
    return $value
}

function Get-MarkdownTableRows {
    param(
        [string]$FullPath,
        [string]$Heading = ''
    )

    if (-not (Test-Path -LiteralPath $FullPath)) {
        throw "Dashboard source not found: $FullPath"
    }

    $lines = [System.IO.File]::ReadAllLines($FullPath, [System.Text.Encoding]::UTF8)
    $startIndex = 0

    if (-not [string]::IsNullOrWhiteSpace($Heading)) {
        $headingPattern = '^#{2,4}\s+' + [regex]::Escape($Heading) + '\s*$'
        $headingIndex = -1
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $headingPattern) {
                $headingIndex = $i
                break
            }
        }
        if ($headingIndex -lt 0) {
            return @()
        }
        $startIndex = $headingIndex + 1
    }

    $headerIndex = -1
    for ($i = $startIndex; $i -lt ($lines.Count - 1); $i++) {
        if (($lines[$i] -match '^\|.*\|\s*$') -and ($lines[$i + 1] -match '^\|?\s*:?-{3,}')) {
            $headerIndex = $i
            break
        }
    }
    if ($headerIndex -lt 0) {
        return @()
    }

    $headers = @($lines[$headerIndex].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
    $rows = [System.Collections.Generic.List[object]]::new()
    for ($i = $headerIndex + 2; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -notmatch '^\|.*\|\s*$') {
            break
        }
        $cells = @($lines[$i].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
        $record = [ordered]@{}
        for ($column = 0; $column -lt $headers.Count; $column++) {
            $record[$headers[$column]] = if ($column -lt $cells.Count) { $cells[$column] } else { '' }
        }
        $rows.Add([pscustomobject]$record)
    }
    return $rows.ToArray()
}

function Get-KeyValueMap {
    param(
        [string]$FullPath,
        [string]$Heading = ''
    )

    $map = [ordered]@{}
    foreach ($row in @(Get-MarkdownTableRows $FullPath $Heading)) {
        if ($null -eq $row.PSObject.Properties['항목']) {
            continue
        }
        if ($null -ne $row.PSObject.Properties['값']) {
            $map[[string]$row.'항목'] = [string]$row.'값'
        }
        elseif ($null -ne $row.PSObject.Properties['현재']) {
            $map[[string]$row.'항목'] = [string]$row.'현재'
        }
    }
    return $map
}

function Get-StatusClass {
    param([string]$Status)

    if ($Status -match '주의|위험|차단|지연') { return 'risk' }
    if ($Status -match '완료|채택|종료') { return 'done' }
    if ($Status -match '대기|보류|미시작') { return 'wait' }
    if ($Status -match '대체|수정|보관') { return 'archived' }
    return 'active'
}

function Get-StatusPillHtml {
    param([string]$Status)
    $className = Get-StatusClass $Status
    return ('<span class="status status--{0}">{1}</span>' -f $className, [System.Net.WebUtility]::HtmlEncode($Status))
}

function Get-SourceBundle {
    param(
        [string[]]$Sources,
        [string]$DisplayLabel
    )

    $chunks = [System.Collections.Generic.List[string]]::new()
    foreach ($relativePath in $Sources) {
        $fullPath = Join-Path $projectRoot $relativePath
        if (-not (Test-Path -LiteralPath $fullPath)) {
            throw "Dashboard source not found: $relativePath"
        }
        $chunks.Add([System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8))
    }

    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $content = $chunks -join "`n`n"
        $hash = [BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($content))).Replace('-', '').Substring(0, 12).ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }

    return @{ Hash = $hash; Count = $Sources.Count; Display = $DisplayLabel }
}

$registryPath = Join-Path $projectRoot 'personas\registry.md'
$registryRows = @(Get-MarkdownTableRows $registryPath)
$agents = [System.Collections.Generic.List[object]]::new()
$allTasks = [System.Collections.Generic.List[object]]::new()

foreach ($row in $registryRows) {
    $id = [string]$row.'ID'
    $directory = [string]$row.'Directory'
    if ([string]::IsNullOrWhiteSpace($id) -or [string]::IsNullOrWhiteSpace($directory)) {
        continue
    }

    $baseRelative = "personas\$directory"
    $stateRelative = "$baseRelative\state.md"
    $outputRelative = "$baseRelative\output.md"
    $inboxRelative = "$baseRelative\inbox.md"
    $researchRelative = "$baseRelative\research.md"
    $updatesRelative = "$baseRelative\updates.md"
    $state = Get-KeyValueMap (Join-Path $projectRoot $stateRelative)
    $output = Get-KeyValueMap (Join-Path $projectRoot $outputRelative)
    $tasks = @(Get-MarkdownTableRows (Join-Path $projectRoot $inboxRelative) 'Task Inbox')
    $updates = @(Get-MarkdownTableRows (Join-Path $projectRoot $updatesRelative))

    foreach ($task in $tasks) {
        $taskId = [string]$task.'ID'
        $matchingUpdate = @($updates | Where-Object { @(([string]$_.'과업 ID') -split '·') -contains $taskId } | Sort-Object @{ Expression = { [string]$_.'날짜' }; Descending = $true } | Select-Object -First 1)
        $actualResult = if ($matchingUpdate.Count -gt 0) { [string]$matchingUpdate[0].'결과' } else { '' }
        $allTasks.Add([pscustomobject]@{
            Id = $taskId
            InputDate = [string]$task.'입력일'
            AgentId = $id
            AgentName = [string]$row.'페르소나'
            AgentPage = "$($id.ToLowerInvariant()).html"
            Task = [string]$task.'질문·변경'
            Deliverable = [string]$task.'기대 산출물'
            ActualResult = $actualResult
            DoneDefinition = [string]$task.'완료 기준'
            TargetDate = [string]$task.'목표일'
            CompletedDate = [string]$task.'완료일'
            Status = [string]$task.'상태'
        })
    }

    $agents.Add([pscustomobject]@{
        Id = $id
        Name = [string]$row.'페르소나'
        Directory = $directory
        Definition = [string]$row.'역할 정의'
        Responsibility = [string]$row.'핵심 책임'
        Deliverables = [string]$row.'주요 산출물'
        Inputs = [string]$row.'받는 정보'
        Reviewers = [string]$row.'검토 역할'
        Decision = [string]$row.'전사 반영'
        Status = [string]$state['상태']
        StatusClass = Get-StatusClass ([string]$state['상태'])
        CurrentTaskIds = [string]$state['현재 과업 ID']
        CurrentTask = [string]$state['현재 과업']
        Focus = [string]$state['초점']
        Blocker = [string]$state['차단 요인']
        NextAction = [string]$state['다음 행동']
        TargetDate = [string]$state['목표일']
        CurrentSource = [string]$state['현재 정본']
        Updated = [string]$state['마지막 갱신']
        Conclusion = [string]$output['결론']
        OutputUpdated = [string]$output['마지막 갱신']
        Output = $output
        Tasks = $tasks
        Updates = $updates
        Sources = @($stateRelative, $outputRelative, $inboxRelative, $researchRelative, $updatesRelative)
        PageFile = "$($id.ToLowerInvariant()).html"
    })
}

if ($agents.Count -eq 0) {
    throw 'No personas found in personas/registry.md'
}

$projectStatusPath = Join-Path $projectRoot 'control\00_project_status.md'
$executionPath = Join-Path $projectRoot 'control\15_execution_control.md'
$decisionPath = Join-Path $projectRoot 'control\08_decision_log.md'
$projectSummary = Get-KeyValueMap $projectStatusPath '기본 현황'
$executionSummary = Get-KeyValueMap $executionPath '지금'
$kpiRows = @(Get-MarkdownTableRows $projectStatusPath '핵심 지표')
$riskRows = @(Get-MarkdownTableRows $projectStatusPath '상위 리스크')
$actionRows = @(Get-MarkdownTableRows $projectStatusPath '지금 할 일')
$pendingDecisionRows = @(Get-MarkdownTableRows $projectStatusPath '다음 의사결정')
$stageRows = @(Get-MarkdownTableRows $executionPath '30일 실행')
$decisionRows = @(Get-MarkdownTableRows $decisionPath '결정 목록')
$latestRoleDate = @($agents | ForEach-Object { $_.Updated } | Sort-Object -Descending | Select-Object -First 1)[0]
$undatedActionCount = @($actionRows | Where-Object { [string]::IsNullOrWhiteSpace([string]$_.'목표일') -or [string]$_.'목표일' -eq '미정' }).Count
$undatedRoleCount = @($agents | Where-Object { [string]::IsNullOrWhiteSpace($_.TargetDate) -or $_.TargetDate -eq '미정' }).Count

function Get-NavHtml {
    param(
        [string]$CurrentId,
        [bool]$IsRoot
    )

    $items = [System.Collections.Generic.List[object]]::new()
    $items.Add([pscustomobject]@{ Id = 'overview'; Label = '전체 현황'; File = 'index.html'; Short = '전체' })
    foreach ($agent in $agents) {
        $items.Add([pscustomobject]@{ Id = $agent.Id; Label = $agent.Name; File = $agent.PageFile; Short = $agent.Id })
    }

    $links = foreach ($item in $items) {
        if ($IsRoot) {
            $href = if ($item.Id -eq 'overview') { 'index.html' } else { "pages/$($item.File)" }
        }
        else {
            $href = if ($item.Id -eq 'overview') { '../index.html' } else { $item.File }
        }
        $current = if ($item.Id -eq $CurrentId) { ' aria-current="page"' } else { '' }
        @"
<a class="nav-link" href="$href"$current><span>$([System.Net.WebUtility]::HtmlEncode($item.Short))</span><strong>$([System.Net.WebUtility]::HtmlEncode($item.Label))</strong></a>
"@
    }
    return ($links -join "`n")
}

function Get-KpiHtml {
    $cards = foreach ($row in $kpiRows) {
        $sourceHref = '../' + ([string]$row.'정본').Replace('\', '/')
        @"
<article class="kpi-card" data-kpi>
  <div class="kpi-card__head"><h3>$(Convert-InlineMarkdown ([string]$row.'지표'))</h3><span>$(Convert-InlineMarkdown ([string]$row.'현재'))</span></div>
  <dl>
    <div><dt>목표·통과 기준</dt><dd>$(Convert-InlineMarkdown ([string]$row.'90일 목표·통과 기준'))</dd></div>
    <div><dt>측정 시작 조건</dt><dd>$(Convert-InlineMarkdown ([string]$row.'측정 시작 조건'))</dd></div>
  </dl>
  <a class="kpi-source" href="$([System.Net.WebUtility]::HtmlEncode($sourceHref))">지표 정의</a>
</article>
"@
    }
    return @"
<section class="panel" aria-labelledby="kpi-title">
  <div class="section-heading"><div><p>핵심 지표</p><h2 id="kpi-title">검증 단계 사업 지표</h2></div><span class="section-note">$([System.Net.WebUtility]::HtmlEncode([string]$projectSummary['마지막 갱신'])) 기준 · 미수집 값은 미측정</span></div>
  <div class="kpi-grid">$($cards -join "`n")</div>
</section>
"@
}

function Get-AgentOverviewTableHtml {
    $rows = foreach ($agent in $agents) {
        @"
<tr data-role-row data-status="$($agent.StatusClass)">
  <td data-label="역할"><a class="role-link" href="pages/$($agent.PageFile)"><strong>$([System.Net.WebUtility]::HtmlEncode($agent.Name))</strong><span>$($agent.Id)</span></a></td>
  <td data-label="상태">$(Get-StatusPillHtml $agent.Status)<span class="freshness" data-freshness="$([System.Net.WebUtility]::HtmlEncode($agent.Updated))">$([System.Net.WebUtility]::HtmlEncode($agent.Updated))</span></td>
  <td data-label="현재 작업"><div class="table-summary">$(Convert-InlineMarkdown $agent.CurrentTask)</div><small>$([System.Net.WebUtility]::HtmlEncode($agent.CurrentTaskIds))</small></td>
  <td data-label="현재 판단"><div class="table-summary">$(Convert-InlineMarkdown $agent.Conclusion)</div></td>
  <td data-label="다음 행동·목표일"><div class="table-summary">$(Convert-InlineMarkdown $agent.NextAction)</div><small>목표일 $([System.Net.WebUtility]::HtmlEncode($agent.TargetDate))</small></td>
</tr>
"@
    }

    return @"
<section class="panel" aria-labelledby="roles-title">
  <div class="section-heading"><div><p>역할별 현황</p><h2 id="roles-title">현재 작업과 판단</h2></div><span class="section-note">상태·과업·다음 행동 비교</span></div>
  <div class="table-wrap">
    <table class="business-table responsive-table role-status-table">
      <thead><tr><th>역할</th><th>상태</th><th>현재 작업</th><th>현재 판단</th><th>다음 행동·목표일</th></tr></thead>
      <tbody>$($rows -join "`n")</tbody>
    </table>
  </div>
  <p class="coverage-note">고객 온보딩·지원·갱신 책임은 현재 SAL·PRD·TEC에 분산돼 있습니다. 유료 고객 운영이 시작되기 전에 책임자를 지정해야 합니다.</p>
</section>
"@
}

function Get-RoleFlowHtml {
    $rows = foreach ($agent in $agents) {
        @"
<tr>
  <td data-label="역할"><a class="role-link role-link--inline" href="pages/$($agent.PageFile)"><strong>$([System.Net.WebUtility]::HtmlEncode($agent.Name))</strong><span>$($agent.Id)</span></a></td>
  <td data-label="받는 정보">$(Convert-InlineMarkdown $agent.Inputs)</td>
  <td data-label="검토 역할">$(Convert-InlineMarkdown $agent.Reviewers)</td>
  <td data-label="전달 결과">$(Convert-InlineMarkdown $agent.Deliverables)</td>
  <td data-label="전사 반영">$(Convert-InlineMarkdown $agent.Decision)</td>
</tr>
"@
    }
    return @"
<section class="panel" aria-labelledby="role-flow-title">
  <div class="section-heading"><div><p>업무 전달 관계</p><h2 id="role-flow-title">역할별 입력·검토·산출물</h2></div><span class="section-note">personas/registry.md 기준</span></div>
  <div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>역할</th><th>받는 정보</th><th>검토 역할</th><th>전달 결과</th><th>전사 반영</th></tr></thead><tbody>$($rows -join "`n")</tbody></table></div>
</section>
"@
}

function Get-StageHtml {
    $items = foreach ($row in $stageRows) {
        $status = [string]$row.'상태'
        @"
<article class="stage-item stage-item--$(Get-StatusClass $status)">
  <div class="stage-item__head"><span>$([System.Net.WebUtility]::HtmlEncode([string]$row.'기간'))</span>$(Get-StatusPillHtml $status)</div>
  <h3>$(Convert-InlineMarkdown ([string]$row.'단계'))</h3>
  <p>$(Convert-InlineMarkdown ([string]$row.'실행'))</p>
  <dl><dt>완료 기준</dt><dd>$(Convert-InlineMarkdown ([string]$row.'완료 조건'))</dd></dl>
</article>
"@
    }
    return @"
<section class="panel" aria-labelledby="stage-title">
  <div class="section-heading"><div><p>실행 단계</p><h2 id="stage-title">30일 운영 계획</h2></div><span class="section-note">완료·진행·대기 상태 유지</span></div>
  <div class="stage-grid">$($items -join "`n")</div>
</section>
"@
}

function Get-ActionsHtml {
    $rows = foreach ($row in $actionRows) {
        @"
<tr>
  <td data-label="우선순위"><span class="priority-number">$([System.Net.WebUtility]::HtmlEncode([string]$row.'우선순위'))</span></td>
  <td data-label="실행 항목"><strong>$(Convert-InlineMarkdown ([string]$row.'행동'))</strong></td>
  <td data-label="담당 역할">$([System.Net.WebUtility]::HtmlEncode([string]$row.'담당 역할'))</td>
  <td data-label="목표일">$([System.Net.WebUtility]::HtmlEncode([string]$row.'목표일'))</td>
  <td data-label="완료 기준">$(Convert-InlineMarkdown ([string]$row.'완료 조건'))</td>
  <td data-label="상태">$(Get-StatusPillHtml ([string]$row.'상태'))</td>
</tr>
"@
    }
    return @"
<section class="panel" aria-labelledby="actions-title">
  <div class="section-heading"><div><p>다음 단계</p><h2 id="actions-title">우선 실행 항목</h2></div><span class="section-note section-note--attention">목표일 미정 ${undatedActionCount}건 · 일정 확정 필요</span></div>
  <div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>순위</th><th>실행 항목</th><th>담당 역할</th><th>목표일</th><th>완료 기준</th><th>상태</th></tr></thead><tbody>$($rows -join "`n")</tbody></table></div>
</section>
"@
}

function Get-RisksHtml {
    $items = foreach ($row in ($riskRows | Select-Object -First 5)) {
        @"
<li><span class="risk-grade">$([System.Net.WebUtility]::HtmlEncode([string]$row.'등급'))</span><div><strong>$(Convert-InlineMarkdown ([string]$row.'리스크'))</strong><p>$(Convert-InlineMarkdown ([string]$row.'대응'))</p></div><span class="risk-state">$([System.Net.WebUtility]::HtmlEncode([string]$row.'상태'))</span></li>
"@
    }
    return @"
<section class="panel compact-panel" aria-labelledby="risks-title">
  <div class="section-heading"><div><p>주요 리스크</p><h2 id="risks-title">확인·합의가 필요한 사항</h2></div></div>
  <ul class="risk-list">$($items -join "`n")</ul>
</section>
"@
}

function Get-DecisionsHtml {
    $recent = @($decisionRows | Where-Object { [string]$_.'범주' -ne '시스템' } | Sort-Object @{ Expression = { [string]$_.'날짜' }; Descending = $true }, @{ Expression = { [string]$_.'ID' }; Descending = $true } | Select-Object -First 6)
    $rows = foreach ($row in $recent) {
        @"
<tr>
  <td data-label="ID"><strong>$([System.Net.WebUtility]::HtmlEncode([string]$row.'ID'))</strong><span class="cell-date">$([System.Net.WebUtility]::HtmlEncode([string]$row.'날짜'))</span></td>
  <td data-label="상태">$(Get-StatusPillHtml ([string]$row.'상태'))</td>
  <td data-label="결정">$(Convert-InlineMarkdown ([string]$row.'결정'))</td>
  <td data-label="결과">$(Convert-InlineMarkdown ([string]$row.'주요 결과'))</td>
</tr>
"@
    }
    return @"
<section class="panel" aria-labelledby="decisions-title">
  <div class="section-heading"><div><p>의사결정 이력</p><h2 id="decisions-title">사업·제품 결정</h2></div><span class="section-note">채택·대체 이력 보존</span></div>
  <div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>ID·날짜</th><th>상태</th><th>결정</th><th>주요 결과</th></tr></thead><tbody>$($rows -join "`n")</tbody></table></div>
</section>
"@
}

function Get-PendingDecisionsHtml {
    $rows = foreach ($row in $pendingDecisionRows) {
        @"
<tr>
  <td data-label="ID"><strong>$([System.Net.WebUtility]::HtmlEncode([string]$row.'ID'))</strong></td>
  <td data-label="결정">$(Convert-InlineMarkdown ([string]$row.'결정'))</td>
  <td data-label="필요한 증거"><div class="table-summary">$(Convert-InlineMarkdown ([string]$row.'필요한 증거'))</div></td>
  <td data-label="결정 시점">$([System.Net.WebUtility]::HtmlEncode([string]$row.'결정 시점'))</td>
  <td data-label="상태">$(Get-StatusPillHtml ([string]$row.'상태'))</td>
</tr>
"@
    }
    return @"
<section class="panel compact-panel" aria-labelledby="pending-decisions-title">
  <div class="section-heading"><div><p>결정 대기</p><h2 id="pending-decisions-title">증거가 필요한 안건</h2></div></div>
  <div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>ID</th><th>결정</th><th>필요한 증거</th><th>시점</th><th>상태</th></tr></thead><tbody>$($rows -join "`n")</tbody></table></div>
</section>
"@
}

function Get-RecordBrowserHtml {
    param(
        [string]$Role = 'ALL',
        [string]$Title = '전체 자료',
        [string]$Description = '질문지·설계·과업·예정·결정·결과·이력을 한곳에서 조회합니다.',
        [string]$BasePath = ''
    )

    $roleFilter = if ($Role -eq 'ALL') { '' } else { $Role }
    $roleControl = if ($Role -eq 'ALL') {
        @"
<label><span>담당 역할</span><select data-record-role-filter><option value="">전체 역할</option><option value="STR">전략·경영</option><option value="MKT">고객·시장</option><option value="PRD">제품·성장</option><option value="SAL">세일즈·마케팅</option><option value="FIN">재무·가격</option><option value="TEC">기술·데이터</option><option value="RSK">리스크·운영</option></select></label>
"@
    }
    else {
        '<input type="hidden" data-record-role-filter value="' + [System.Net.WebUtility]::HtmlEncode($Role) + '">'
    }

    return @"
<section class="panel record-browser" aria-labelledby="records-title-$Role" data-record-browser data-record-role="$roleFilter" data-record-base="$BasePath">
  <div class="section-heading"><div><p>자료 조회</p><h2 id="records-title-$Role">$([System.Net.WebUtility]::HtmlEncode($Title))</h2></div><span class="section-note">검색 결과는 정적 상세 화면으로 연결</span></div>
  <p class="record-browser__description">$([System.Net.WebUtility]::HtmlEncode($Description))</p>
  <div class="record-filters">
    <label class="record-search"><span>검색어</span><input type="search" data-record-query placeholder="ID, 제목, 내용, 정본 경로 검색" autocomplete="off"></label>
    <label><span>자료 유형</span><select data-record-type><option value="">전체 유형</option><option value="task">과업</option><option value="plan">예정 내역</option><option value="questionnaire">질문지</option><option value="design">설계·기획</option><option value="decision">결정</option><option value="question">결정 대기</option><option value="status">현재 상태</option><option value="result">현재 판단</option><option value="update">업무 이력</option><option value="task_register">과업 대장</option><option value="update_register">이력 대장</option><option value="risk">리스크</option><option value="metric">지표</option><option value="hypothesis">가설</option><option value="research">조사</option><option value="document">문서</option></select></label>
    <label><span>상태</span><select data-record-status><option value="">전체 상태</option><option value="진행">진행</option><option value="대기">대기</option><option value="완료">완료</option><option value="채택">채택</option><option value="미측정">미측정</option><option value="기록">기록</option></select></label>
    $roleControl
  </div>
  <div class="record-browser__status" aria-live="polite"><strong data-record-count>자료 준비 중</strong><span>최신 기준일 우선</span></div>
  <div class="record-results" data-record-results></div>
  <button class="record-more" type="button" data-record-more hidden>다음 자료 보기</button>
  <noscript><p class="empty-state">자료 검색은 JavaScript가 필요합니다. 원본은 control·personas·system 폴더에서 확인할 수 있습니다.</p></noscript>
</section>
"@
}

function Get-CompletedWorkHtml {
    $completed = @($allTasks | Where-Object { $_.Status -match '완료' } | Sort-Object @{ Expression = { $_.CompletedDate }; Descending = $true }, @{ Expression = { $_.Id }; Descending = $true })
    if ($completed.Count -eq 0) {
        return '<section class="panel" aria-labelledby="completed-title"><div class="section-heading"><div><p>완료 이력</p><h2 id="completed-title">완료 업무</h2></div></div><p class="empty-state">완료 업무가 없습니다.</p></section>'
    }
    $rows = foreach ($task in $completed) {
        @"
<tr>
  <td data-label="완료일"><span class="cell-date">$([System.Net.WebUtility]::HtmlEncode($task.CompletedDate))</span></td>
  <td data-label="담당"><a class="role-link role-link--inline" href="pages/$($task.AgentPage)"><strong>$([System.Net.WebUtility]::HtmlEncode($task.AgentName))</strong><span>$([System.Net.WebUtility]::HtmlEncode($task.AgentId))</span></a></td>
  <td data-label="과업"><strong>$(Convert-InlineMarkdown $task.Task)</strong><small>$([System.Net.WebUtility]::HtmlEncode($task.Id))</small></td>
  <td data-label="실제 결과">$(Convert-InlineMarkdown $task.ActualResult)</td>
</tr>
"@
    }
    return @"
<section class="panel" aria-labelledby="completed-title">
  <div class="section-heading"><div><p>완료 이력</p><h2 id="completed-title">완료 업무</h2></div><span class="section-note">완료일 기준</span></div>
  <div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>완료일</th><th>담당</th><th>과업</th><th>실제 결과</th></tr></thead><tbody>$($rows -join "`n")</tbody></table></div>
</section>
"@
}

function Get-RecentTasksHtml {
    $recent = @($allTasks | Where-Object { $_.Status -notmatch '완료|종료|채택' } | Sort-Object @{ Expression = { $_.InputDate }; Descending = $true }, @{ Expression = { $_.Id }; Descending = $true } | Select-Object -First 10)
    $rows = foreach ($task in $recent) {
        $agent = $agents | Where-Object { $_.Id -eq $task.AgentId } | Select-Object -First 1
        @"
<tr>
  <td data-label="입력일"><span class="cell-date">$([System.Net.WebUtility]::HtmlEncode($task.InputDate))</span></td>
  <td data-label="담당"><a class="role-link role-link--inline" href="pages/$($agent.PageFile)"><strong>$([System.Net.WebUtility]::HtmlEncode($task.AgentName))</strong><span>$($task.AgentId)</span></a></td>
  <td data-label="업무"><strong>$(Convert-InlineMarkdown $task.Task)</strong><small>$([System.Net.WebUtility]::HtmlEncode($task.Id))</small></td>
  <td data-label="결과물">$(Convert-InlineMarkdown $task.Deliverable)</td>
  <td data-label="상태">$(Get-StatusPillHtml $task.Status)</td>
</tr>
"@
    }
    return @"
<section class="panel" aria-labelledby="tasks-title">
  <div class="section-heading"><div><p>현재 업무</p><h2 id="tasks-title">진행·대기 과업</h2></div><span class="section-note">완료 과업은 완료 이력에서 관리</span></div>
  <div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>입력일</th><th>담당</th><th>업무</th><th>예정 결과물</th><th>상태</th></tr></thead><tbody>$($rows -join "`n")</tbody></table></div>
</section>
"@
}

function Get-OverviewHtml {
    $overallStatus = [string]$projectSummary['전체 상태']
    return @"
<section class="business-summary">
  <article class="summary-primary">
    <div class="summary-primary__head"><div><p>현재 사업 단계</p><h2>$(Convert-InlineMarkdown ([string]$projectSummary['사업 단계']))</h2></div>$(Get-StatusPillHtml $overallStatus)</div>
    <dl class="summary-gates">
      <div><dt>사업 목표</dt><dd>$(Convert-InlineMarkdown ([string]$executionSummary['목표']))</dd></div>
      <div><dt>다음 사업 게이트</dt><dd>$(Convert-InlineMarkdown ([string]$projectSummary['다음 사업 게이트']))</dd></div>
      <div><dt>다음 기술 게이트</dt><dd>$(Convert-InlineMarkdown ([string]$projectSummary['다음 기술 게이트']))</dd></div>
    </dl>
  </article>
  <aside class="summary-facts">
    <dl>
      <div><dt>제품 단계</dt><dd>$(Convert-InlineMarkdown ([string]$projectSummary['제품 단계']))</dd></div>
      <div><dt>기존 등록 사용자</dt><dd>$(Convert-InlineMarkdown ([string]$projectSummary['기존 등록 사용자']))</dd></div>
      <div><dt>북극성 지표</dt><dd>$(Convert-InlineMarkdown ([string]$projectSummary['북극성 지표']))</dd></div>
      <div><dt>전사 현황 기준일</dt><dd>$([System.Net.WebUtility]::HtmlEncode([string]$projectSummary['마지막 갱신']))</dd></div>
      <div><dt>최근 역할 보고일</dt><dd>$([System.Net.WebUtility]::HtmlEncode([string]$latestRoleDate))</dd></div>
      <div><dt>목표일 미정</dt><dd class="attention-value">전사 실행 ${undatedActionCount}건 · 역할 ${undatedRoleCount}개</dd></div>
    </dl>
  </aside>
</section>
$(Get-KpiHtml)
$(Get-AgentOverviewTableHtml)
$(Get-RoleFlowHtml)
$(Get-RecentTasksHtml)
$(Get-RisksHtml)
$(Get-PendingDecisionsHtml)
$(Get-ActionsHtml)
$(Get-StageHtml)
$(Get-CompletedWorkHtml)
$(Get-DecisionsHtml)
$(Get-RecordBrowserHtml -BasePath '')
"@
}

function Get-AgentTasksHtml {
    param([object]$Agent)

    if ($Agent.Tasks.Count -eq 0) {
        return '<p class="empty-state">등록된 과업이 없습니다.</p>'
    }
    $rows = foreach ($task in ($Agent.Tasks | Sort-Object @{ Expression = { [string]$_.'입력일' }; Descending = $true }, @{ Expression = { [string]$_.'ID' }; Descending = $true })) {
        @"
<tr>
  <td data-label="ID"><strong>$([System.Net.WebUtility]::HtmlEncode([string]$task.'ID'))</strong><span class="cell-date">$([System.Net.WebUtility]::HtmlEncode([string]$task.'입력일'))</span></td>
  <td data-label="업무">$(Convert-InlineMarkdown ([string]$task.'질문·변경'))</td>
  <td data-label="예정 결과물">$(Convert-InlineMarkdown ([string]$task.'기대 산출물'))</td>
  <td data-label="완료 기준">$(Convert-InlineMarkdown ([string]$task.'완료 기준'))</td>
  <td data-label="목표일">$([System.Net.WebUtility]::HtmlEncode([string]$task.'목표일'))</td>
  <td data-label="완료일">$([System.Net.WebUtility]::HtmlEncode([string]$task.'완료일'))</td>
  <td data-label="상태">$(Get-StatusPillHtml ([string]$task.'상태'))</td>
</tr>
"@
    }
    return '<div class="table-wrap"><table class="business-table responsive-table"><thead><tr><th>ID·입력일</th><th>업무</th><th>예정 결과물</th><th>완료 기준</th><th>목표일</th><th>완료일</th><th>상태</th></tr></thead><tbody>' + ($rows -join "`n") + '</tbody></table></div>'
}

function Get-AgentOutputHtml {
    param([object]$Agent)

    $items = foreach ($entry in $Agent.Output.GetEnumerator()) {
        if ($entry.Key -in @('결론', '정본', '마지막 갱신')) { continue }
        @"
<div><dt>$([System.Net.WebUtility]::HtmlEncode([string]$entry.Key))</dt><dd>$(Convert-InlineMarkdown ([string]$entry.Value))</dd></div>
"@
    }
    return ($items -join "`n")
}

function Get-AgentUpdatesHtml {
    param([object]$Agent)

    if ($Agent.Updates.Count -eq 0) {
        return '<p class="empty-state">등록된 업무 업데이트가 없습니다.</p>'
    }
    $items = foreach ($update in ($Agent.Updates | Sort-Object @{ Expression = { [string]$_.'날짜' }; Descending = $true })) {
        @"
<article class="update-item">
  <div class="update-item__meta"><time>$([System.Net.WebUtility]::HtmlEncode([string]$update.'날짜'))</time>$(Get-StatusPillHtml ([string]$update.'상태'))</div>
  <h3>$(Convert-InlineMarkdown ([string]$update.'완료·변경')) <small>$([System.Net.WebUtility]::HtmlEncode([string]$update.'과업 ID'))</small></h3>
  <p>$(Convert-InlineMarkdown ([string]$update.'결과'))</p>
  <dl><dt>다음 단계</dt><dd>$(Convert-InlineMarkdown ([string]$update.'다음 단계'))</dd></dl>
</article>
"@
    }
    return '<div class="update-list">' + ($items -join "`n") + '</div>'
}

function Get-AgentPageHtml {
    param([object]$Agent)

    return @"
<section class="role-intro">
  <article class="role-definition">
    <p class="role-code">$($Agent.Id) · 역할 정의</p>
    <h2>$(Convert-InlineMarkdown $Agent.Definition)</h2>
    <dl>
      <div><dt>핵심 책임</dt><dd>$(Convert-InlineMarkdown $Agent.Responsibility)</dd></div>
      <div><dt>현재 목표</dt><dd>$(Convert-InlineMarkdown $Agent.Focus)</dd></div>
      <div><dt>주요 산출물</dt><dd>$(Convert-InlineMarkdown $Agent.Deliverables)</dd></div>
    </dl>
  </article>
  <aside class="role-current">
    <div class="role-current__head">$(Get-StatusPillHtml $Agent.Status)<span class="freshness" data-freshness="$([System.Net.WebUtility]::HtmlEncode($Agent.Updated))">$([System.Net.WebUtility]::HtmlEncode($Agent.Updated))</span></div>
    <dl>
      <div><dt>현재 작업</dt><dd>$(Convert-InlineMarkdown $Agent.CurrentTask)<small>$([System.Net.WebUtility]::HtmlEncode($Agent.CurrentTaskIds))</small></dd></div>
      <div><dt>다음 행동</dt><dd>$(Convert-InlineMarkdown $Agent.NextAction)<small>목표일 $([System.Net.WebUtility]::HtmlEncode($Agent.TargetDate))</small></dd></div>
      <div class="role-current__blocker"><dt>차단 사항</dt><dd>$(Convert-InlineMarkdown $Agent.Blocker)</dd></div>
    </dl>
  </aside>
</section>

<section class="panel result-panel" aria-labelledby="result-title">
  <div class="section-heading"><div><p>현재 판단</p><h2 id="result-title">핵심 결론</h2></div><span class="section-note">$([System.Net.WebUtility]::HtmlEncode($Agent.OutputUpdated)) 기준</span></div>
  <blockquote>$(Convert-InlineMarkdown $Agent.Conclusion)</blockquote>
  <dl class="result-grid">$(Get-AgentOutputHtml $Agent)</dl>
</section>

<section class="panel" aria-labelledby="role-tasks-title">
  <div class="section-heading"><div><p>업무 목록</p><h2 id="role-tasks-title">등록 과업</h2></div><span class="section-note">등록 $($Agent.Tasks.Count)건</span></div>
  $(Get-AgentTasksHtml $Agent)
</section>

<section class="panel" aria-labelledby="collaboration-title">
  <div class="section-heading"><div><p>협업 관계</p><h2 id="collaboration-title">입력과 산출물</h2></div></div>
  <dl class="relation-list">
    <div><dt>받는 정보</dt><dd>$(Convert-InlineMarkdown $Agent.Inputs)</dd></div>
    <div><dt>검토 역할</dt><dd>$(Convert-InlineMarkdown $Agent.Reviewers)</dd></div>
    <div><dt>전달 결과</dt><dd>$(Convert-InlineMarkdown $Agent.Deliverables)</dd></div>
    <div><dt>전사 반영</dt><dd>$(Convert-InlineMarkdown $Agent.Decision)</dd></div>
  </dl>
</section>

<section class="panel" aria-labelledby="source-title">
  <div class="section-heading"><div><p>관련 문서</p><h2 id="source-title">상태·결과·업무 기록</h2></div></div>
  <ul class="source-list">
    <li><a href="../../personas/$($Agent.Directory)/state.md">현재 상태</a></li>
    <li><a href="../../personas/$($Agent.Directory)/output.md">현재 판단</a></li>
    <li><a href="../../personas/$($Agent.Directory)/inbox.md">업무 목록</a></li>
    <li><a href="../../personas/$($Agent.Directory)/updates.md">업데이트 이력</a></li>
    <li><a href="../../personas/$($Agent.Directory)/research.md">조사 기록</a></li>
  </ul>
</section>

<section class="panel" aria-labelledby="updates-title">
  <div class="section-heading"><div><p>업무 이력</p><h2 id="updates-title">날짜별 업데이트</h2></div><span class="section-note">과거 보고 누적</span></div>
  $(Get-AgentUpdatesHtml $Agent)
</section>

$(Get-RecordBrowserHtml -Role $Agent.Id -Title "$($Agent.Name) 전체 자료" -Description '이 역할의 질문지·설계·과업·결과·조사·이력을 조회합니다.' -BasePath '../')
"@
}

function New-DashboardDocument {
    param(
        [string]$CurrentId,
        [string]$Title,
        [string]$Description,
        [string]$BodyHtml,
        [string]$OutputPath,
        [bool]$IsRoot,
        [string[]]$Sources,
        [string]$SourceLabel,
        [string]$DataDate
    )

    $bundle = Get-SourceBundle $Sources $SourceLabel
    $assetPrefix = if ($IsRoot) { 'assets/' } else { '../assets/' }
    $catalogPrefix = if ($IsRoot) { 'data/' } else { '../data/' }
    $homeHref = if ($IsRoot) { 'index.html' } else { '../index.html' }
    $navHtml = Get-NavHtml $CurrentId $IsRoot
    $generatedAt = $DataDate
    $document = @"
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="$([System.Net.WebUtility]::HtmlEncode($Description))">
  <meta name="color-scheme" content="light">
  <title>$([System.Net.WebUtility]::HtmlEncode($Title)) · BIGSEE</title>
  <link rel="stylesheet" href="${assetPrefix}styles.css">
</head>
<body data-page="$CurrentId">
  <button class="mobile-nav-button" type="button" data-nav-toggle aria-controls="primary-navigation" aria-expanded="false"><span>메뉴</span><strong>$([System.Net.WebUtility]::HtmlEncode($Title))</strong></button>
  <div class="app-shell">
    <aside class="sidebar" id="primary-navigation">
      <a class="brand" href="$homeHref"><strong>BIGSEE</strong><span>사업 운영</span></a>
      <nav class="primary-nav" aria-label="대시보드 화면">$navHtml</nav>
      <div class="sidebar-meta"><span>데이터 기준</span><strong>$([System.Net.WebUtility]::HtmlEncode($DataDate))</strong><small>7개 역할 현황</small></div>
    </aside>
    <div class="page-shell">
      <main>
        <header class="page-header">
          <div><p>BIGSEE 사업 운영</p><h1>$([System.Net.WebUtility]::HtmlEncode($Title))</h1><span>$([System.Net.WebUtility]::HtmlEncode($Description))</span></div>
          <dl><div><dt>기준일</dt><dd>$([System.Net.WebUtility]::HtmlEncode($DataDate))</dd></div><div><dt>화면 갱신</dt><dd>$generatedAt</dd></div></dl>
        </header>
        $BodyHtml
      </main>
      <footer><details class="data-info"><summary>데이터 정보</summary><div><span>데이터 출처: $([System.Net.WebUtility]::HtmlEncode($bundle.Display))</span><span>$($bundle.Count)개 문서 · 검증 $($bundle.Hash)</span></div></details></footer>
    </div>
  </div>
  <div class="nav-backdrop" data-nav-close></div>
  <script src="${catalogPrefix}catalog.js"></script>
  <script src="${assetPrefix}app.js"></script>
</body>
</html>
"@
    $document = [regex]::Replace($document, '(?m)^[\t ]+$', '')
    [System.IO.File]::WriteAllText($OutputPath, $document, $utf8NoBom)
}

$overviewSources = @(
    'control\00_project_status.md',
    'control\15_execution_control.md',
    'control\08_decision_log.md',
    'personas\registry.md'
)
foreach ($agent in $agents) {
    $overviewSources += $agent.Sources
}

$overviewBody = Get-OverviewHtml
New-DashboardDocument `
    -CurrentId 'overview' `
    -Title '사업 운영 현황' `
    -Description '사업 목표, 핵심 지표, 역할별 업무, 다음 단계, 결정과 위험을 관리합니다.' `
    -BodyHtml $overviewBody `
    -OutputPath (Join-Path $dashboardRoot 'index.html') `
    -IsRoot $true `
    -Sources $overviewSources `
    -SourceLabel '전사 현황·실행·결정·7개 역할 상태' `
    -DataDate ([string]$projectSummary['마지막 갱신'])

foreach ($agent in $agents) {
    $body = Get-AgentPageHtml $agent
    New-DashboardDocument `
        -CurrentId $agent.Id `
        -Title $agent.Name `
        -Description $agent.Responsibility `
        -BodyHtml $body `
        -OutputPath (Join-Path $pagesRoot $agent.PageFile) `
        -IsRoot $false `
        -Sources (@('personas\registry.md', 'system\12_persona_harness.md') + $agent.Sources) `
        -SourceLabel "$($agent.Name) 역할 정의·현재 상태·업무·판단·이력" `
        -DataDate $agent.Updated
}

$requiredOutputs = @((Join-Path $dashboardRoot 'index.html')) + @($agents | ForEach-Object { Join-Path $pagesRoot $_.PageFile })
$forbiddenUiTerms = @('OPERATING SYSTEM', 'MD LIVE', 'LIVE PERSONA BOARD', 'OPERATING ARCHITECTURE', 'CANONICAL DETAIL', 'NEXT CONTROL POINT', 'ROLE CONNECTIONS', 'inbox 기준', '에이전트')
$catalogPath = Join-Path $dashboardRoot 'data\catalog.js'
$manifestPath = Join-Path $dashboardRoot 'data\manifest.json'
if (-not (Test-Path -LiteralPath $catalogPath) -or -not (Test-Path -LiteralPath $manifestPath)) {
    throw 'Dashboard catalog outputs are missing'
}

foreach ($output in $requiredOutputs) {
    if (-not (Test-Path -LiteralPath $output)) {
        throw "Dashboard output missing: $output"
    }
    $html = [System.IO.File]::ReadAllText($output, [System.Text.Encoding]::UTF8)
    if (($html | Select-String -Pattern 'class="nav-link"' -AllMatches).Matches.Count -ne ($agents.Count + 1)) {
        throw "Navigation count validation failed: $output"
    }
    foreach ($term in $forbiddenUiTerms) {
        if ($html.Contains($term)) {
            throw "Removed UI term found '$term': $output"
        }
    }
    if ($html -notmatch '검증 [a-f0-9]{12}') {
        throw "Source hash validation failed: $output"
    }
    if ($html -match 'class="two-column"|-webkit-line-clamp') {
        throw "Hidden or multi-column section layout found: $output"
    }
    if ($html -notmatch 'data-record-browser' -or $html -notmatch 'catalog\.js') {
        throw "Record browser validation failed: $output"
    }
}

$overviewHtml = [System.IO.File]::ReadAllText((Join-Path $dashboardRoot 'index.html'), [System.Text.Encoding]::UTF8)
if (($overviewHtml | Select-String -Pattern 'data-kpi' -AllMatches).Matches.Count -ne $kpiRows.Count) {
    throw 'Business KPI validation failed'
}
if (($overviewHtml | Select-String -Pattern 'data-role-row' -AllMatches).Matches.Count -ne $agents.Count) {
    throw 'Persona overview validation failed'
}

foreach ($agent in $agents) {
    $agentHtml = [System.IO.File]::ReadAllText((Join-Path $pagesRoot $agent.PageFile), [System.Text.Encoding]::UTF8)
    foreach ($requiredText in @('역할 정의', '현재 작업', '현재 판단', '업무 목록', '업무 이력')) {
        if (-not $agentHtml.Contains($requiredText)) {
            throw "Persona section '$requiredText' missing: $($agent.Id)"
        }
    }
    if ($agentHtml -notmatch "records-title-$($agent.Id)") {
        throw "Persona record library missing: $($agent.Id)"
    }
}

Write-Output "Business dashboard generated: $($requiredOutputs.Count) pages / $($agents.Count) personas / $($kpiRows.Count) KPIs"
