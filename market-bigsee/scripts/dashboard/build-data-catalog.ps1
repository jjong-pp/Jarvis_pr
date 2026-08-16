param(
    [string]$DashboardScriptRoot = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$projectRoot = (Resolve-Path (Join-Path $DashboardScriptRoot '..\..')).Path
$dashboardRoot = Join-Path $projectRoot 'dashboard'
$dataRoot = Join-Path $dashboardRoot 'data'
$recordsRoot = Join-Path $dashboardRoot 'records'

foreach ($directory in @($dataRoot, $recordsRoot)) {
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }
}

# records/ contains generated HTML only. Remove stale pages before rebuilding so
# deleted or renamed source records do not remain visible on another local clone.
$expectedRecordsRoot = [System.IO.Path]::GetFullPath((Join-Path $dashboardRoot 'records'))
$resolvedRecordsRoot = [System.IO.Path]::GetFullPath($recordsRoot)
if ($resolvedRecordsRoot -ne $expectedRecordsRoot) {
    throw "Unsafe records output path: $resolvedRecordsRoot"
}
Get-ChildItem -LiteralPath $recordsRoot -File -Filter '*.html' | ForEach-Object {
    Remove-Item -LiteralPath $_.FullName -Force
}

function Get-ShortHash {
    param(
        [string]$Value,
        [int]$Length = 10
    )

    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
        return [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-', '').Substring(0, $Length).ToUpperInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Convert-ToRelativePath {
    param([string]$FullPath)

    $rootUri = [Uri]::new(($projectRoot.TrimEnd('\') + '\'))
    $fileUri = [Uri]::new($FullPath)
    return [Uri]::UnescapeDataString($rootUri.MakeRelativeUri($fileUri).ToString()).Replace('/', '\')
}

function Convert-InlineMarkdown {
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return '<span class="empty-value">미확인</span>'
    }

    $value = [System.Net.WebUtility]::HtmlEncode($Text.Trim())
    $value = [regex]::Replace($value, '\[([^\]]+)\]\((https?://[^)]+)\)', '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    $value = [regex]::Replace($value, '\[([^\]]+)\]\(([^)]+)\)', '<span class="document-reference">$1 <small>$2</small></span>')
    $value = [regex]::Replace($value, '\*\*([^*]+)\*\*', '<strong>$1</strong>')
    $value = [regex]::Replace($value, '`([^`]+)`', '<code>$1</code>')
    return $value
}

function Convert-MarkdownDocumentToHtml {
    param([string]$Markdown)

    $content = [regex]::Replace($Markdown, '(?s)^\s*<!--\s*bigsee-record\s*.*?-->\s*', '').Trim()
    $lines = @($content -split "`r?`n")
    $html = [System.Collections.Generic.List[string]]::new()
    $paragraph = [System.Collections.Generic.List[string]]::new()
    $state = @{ ListType = '' }
    $inCode = $false

    $flushParagraph = {
        if ($paragraph.Count -gt 0) {
            $html.Add('<p>' + (Convert-InlineMarkdown ($paragraph -join ' ')) + '</p>')
            $paragraph.Clear()
        }
    }
    $closeList = {
        if (-not [string]::IsNullOrWhiteSpace($state.ListType)) {
            $html.Add("</$($state.ListType)>")
            $state.ListType = ''
        }
    }

    for ($index = 0; $index -lt $lines.Count; $index++) {
        $line = [string]$lines[$index]

        if ($line -match '^```') {
            & $flushParagraph
            & $closeList
            if ($inCode) {
                $html.Add('</code></pre>')
                $inCode = $false
            }
            else {
                $html.Add('<pre class="record-code"><code>')
                $inCode = $true
            }
            continue
        }
        if ($inCode) {
            $html.Add([System.Net.WebUtility]::HtmlEncode($line))
            continue
        }
        if ([string]::IsNullOrWhiteSpace($line)) {
            & $flushParagraph
            & $closeList
            continue
        }
        if (($line -match '^\|.*\|\s*$') -and (($index + 1) -lt $lines.Count) -and ($lines[$index + 1] -match '^\|?\s*:?-{3,}')) {
            & $flushParagraph
            & $closeList
            $headers = @($line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
            $index += 2
            $rows = [System.Collections.Generic.List[string]]::new()
            while (($index -lt $lines.Count) -and ($lines[$index] -match '^\|.*\|\s*$')) {
                $cells = @($lines[$index].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
                $cellHtml = for ($cellIndex = 0; $cellIndex -lt $headers.Count; $cellIndex++) {
                    $cellValue = if ($cellIndex -lt $cells.Count) { $cells[$cellIndex] } else { '' }
                    '<td data-label="' + [System.Net.WebUtility]::HtmlEncode($headers[$cellIndex]) + '">' + (Convert-InlineMarkdown $cellValue) + '</td>'
                }
                $rows.Add('<tr>' + ($cellHtml -join '') + '</tr>')
                $index++
            }
            $index--
            $headerHtml = $headers | ForEach-Object { '<th>' + [System.Net.WebUtility]::HtmlEncode($_) + '</th>' }
            $html.Add('<div class="table-wrap"><table class="business-table responsive-table"><thead><tr>' + ($headerHtml -join '') + '</tr></thead><tbody>' + ($rows -join '') + '</tbody></table></div>')
            continue
        }
        if ($line -match '^(#{1,4})\s+(.+)$') {
            & $flushParagraph
            & $closeList
            $level = [Math]::Min(5, $matches[1].Length + 1)
            $html.Add("<h$level>" + (Convert-InlineMarkdown $matches[2]) + "</h$level>")
            continue
        }
        if ($line -match '^\s*[-*]\s+(.+)$') {
            & $flushParagraph
            if ($state.ListType -ne 'ul') {
                & $closeList
                $state.ListType = 'ul'
                $html.Add('<ul>')
            }
            $html.Add('<li>' + (Convert-InlineMarkdown $matches[1]) + '</li>')
            continue
        }
        if ($line -match '^\s*\d+[.)]\s+(.+)$') {
            & $flushParagraph
            if ($state.ListType -ne 'ol') {
                & $closeList
                $state.ListType = 'ol'
                $html.Add('<ol>')
            }
            $html.Add('<li>' + (Convert-InlineMarkdown $matches[1]) + '</li>')
            continue
        }
        if ($line -match '^>\s*(.*)$') {
            & $flushParagraph
            & $closeList
            $html.Add('<blockquote>' + (Convert-InlineMarkdown $matches[1]) + '</blockquote>')
            continue
        }
        if ($line -match '^\s*---+\s*$') {
            & $flushParagraph
            & $closeList
            $html.Add('<hr>')
            continue
        }
        $paragraph.Add($line.Trim())
    }

    & $flushParagraph
    & $closeList
    if ($inCode) { $html.Add('</code></pre>') }
    return $html -join "`n"
}

function Get-MarkdownTableRows {
    param(
        [string]$FullPath,
        [string]$Heading = ''
    )

    $lines = [System.IO.File]::ReadAllLines($FullPath, [System.Text.Encoding]::UTF8)
    $startIndex = 0
    if (-not [string]::IsNullOrWhiteSpace($Heading)) {
        $headingPattern = '^#{2,4}\s+' + [regex]::Escape($Heading) + '\s*$'
        $headingIndex = -1
        for ($index = 0; $index -lt $lines.Count; $index++) {
            if ($lines[$index] -match $headingPattern) {
                $headingIndex = $index
                break
            }
        }
        if ($headingIndex -lt 0) { return @() }
        $startIndex = $headingIndex + 1
    }

    $headerIndex = -1
    for ($index = $startIndex; $index -lt ($lines.Count - 1); $index++) {
        if (($lines[$index] -match '^\|.*\|\s*$') -and ($lines[$index + 1] -match '^\|?\s*:?-{3,}')) {
            $headerIndex = $index
            break
        }
    }
    if ($headerIndex -lt 0) { return @() }

    $headers = @($lines[$headerIndex].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
    $rows = [System.Collections.Generic.List[object]]::new()
    for ($index = $headerIndex + 2; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -notmatch '^\|.*\|\s*$') { break }
        $cells = @($lines[$index].Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
        $record = [ordered]@{}
        for ($column = 0; $column -lt $headers.Count; $column++) {
            $record[$headers[$column]] = if ($column -lt $cells.Count) { $cells[$column] } else { '' }
        }
        $rows.Add([pscustomobject]$record)
    }
    return $rows.ToArray()
}

function Get-RecordMetadata {
    param([string]$Content)

    $match = [regex]::Match($Content, '(?s)<!--\s*bigsee-record\s*(\{.*?\})\s*-->')
    if (-not $match.Success) { return $null }
    try {
        return $match.Groups[1].Value | ConvertFrom-Json
    }
    catch {
        throw "Invalid bigsee-record metadata: $($_.Exception.Message)"
    }
}

function Get-DocumentTitle {
    param(
        [string]$Content,
        [string]$Fallback
    )
    $match = [regex]::Match($Content, '(?m)^#\s+(.+?)\s*$')
    if ($match.Success) { return $match.Groups[1].Value.Trim() }
    return $Fallback
}

function Get-DocumentSummary {
    param([string]$Content)

    $summaryContent = [regex]::Replace($Content, '(?s)^\s*<!--\s*bigsee-record\s*.*?-->\s*', '')
    foreach ($line in @($summaryContent -split "`r?`n")) {
        $value = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($value)) { continue }
        if ($value -match '^(#|\||```|<!--|-->|기준일\s*:|상태\s*:|용도\s*:|읽기 원칙\s*:)') { continue }
        $plain = [regex]::Replace($value, '[`*_>#\[\]()]', '')
        if ($plain.Length -gt 220) { return $plain.Substring(0, 217) + '...' }
        return $plain
    }
    return '요약 미등록'
}

function Get-DocumentDate {
    param(
        [string]$Content,
        [object]$Metadata
    )

    if (($null -ne $Metadata) -and ($null -ne $Metadata.PSObject.Properties['updated_at']) -and -not [string]::IsNullOrWhiteSpace([string]$Metadata.updated_at)) {
        return [string]$Metadata.updated_at
    }
    foreach ($pattern in @(
        '(?m)^\s*(?:기준일|마지막 갱신)\s*:\s*(20\d{2}-\d{2}-\d{2})',
        '(?m)^\|\s*(?:기준일|마지막 갱신)\s*\|\s*(20\d{2}-\d{2}-\d{2})\s*\|'
    )) {
        $match = [regex]::Match($Content, $pattern)
        if ($match.Success) { return $match.Groups[1].Value }
    }
    $dateMatch = [regex]::Match(($Content -split "`r?`n" | Select-Object -First 40) -join "`n", '20\d{2}-\d{2}-\d{2}')
    if ($dateMatch.Success) { return $dateMatch.Value }
    return '미확인'
}

function Get-DocumentStatus {
    param(
        [string]$Content,
        [object]$Metadata
    )

    if (($null -ne $Metadata) -and ($null -ne $Metadata.PSObject.Properties['status']) -and -not [string]::IsNullOrWhiteSpace([string]$Metadata.status)) {
        return [string]$Metadata.status
    }
    foreach ($pattern in @(
        '(?m)^\s*상태\s*:\s*(.+?)\s*$',
        '(?m)^\|\s*상태\s*\|\s*(.+?)\s*\|\s*$'
    )) {
        $match = [regex]::Match($Content, $pattern)
        if ($match.Success) { return $match.Groups[1].Value.Trim() }
    }
    return '기록'
}

function Get-RoleFromPath {
    param([string]$RelativePath)

    $mapping = [ordered]@{
        '01_strategy_ceo' = 'STR'
        '02_customer_market' = 'MKT'
        '03_product_growth' = 'PRD'
        '04_sales_marketing' = 'SAL'
        '05_finance_pricing' = 'FIN'
        '06_technology_data' = 'TEC'
        '07_risk_operations' = 'RSK'
    }
    foreach ($key in $mapping.Keys) {
        if ($RelativePath -like "*personas\$key\*") { return $mapping[$key] }
    }
    return 'ALL'
}

function Get-DocumentType {
    param(
        [string]$RelativePath,
        [string]$Title,
        [object]$Metadata
    )

    if (($null -ne $Metadata) -and ($null -ne $Metadata.PSObject.Properties['type']) -and -not [string]::IsNullOrWhiteSpace([string]$Metadata.type)) {
        return [string]$Metadata.type
    }
    $name = [System.IO.Path]::GetFileName($RelativePath).ToLowerInvariant()
    $combined = ($RelativePath + ' ' + $Title).ToLowerInvariant()
    if ($name -eq 'inbox.md') { return 'task_register' }
    if ($name -eq 'updates.md') { return 'update_register' }
    if ($name -eq 'state.md') { return 'status' }
    if ($name -eq 'output.md') { return 'result' }
    if ($name -eq 'research.md') { return 'research' }
    if ($combined -match '질문|question|advisor|자문|developer_business_technical') { return 'questionnaire' }
    if ($combined -match 'risk|리스크|약관|정책|계약|compensation') { return 'risk' }
    if ($combined -match '설계|기획|architecture|plan|replan|system|운영|harness|dashboard|registry|manual') { return 'design' }
    if ($combined -match 'research|시장|경쟁|benchmark|조사') { return 'research' }
    return 'document'
}

$typeLabels = [ordered]@{
    task = '과업'
    update = '업무 이력'
    decision = '결정'
    question = '결정 대기'
    risk = '리스크'
    metric = '지표'
    hypothesis = '가설'
    plan = '예정 내역'
    questionnaire = '질문지'
    design = '설계·기획'
    status = '현재 상태'
    result = '현재 판단'
    task_register = '과업 대장'
    update_register = '이력 대장'
    research = '조사'
    document = '문서'
}

$roleLabels = [ordered]@{
    ALL = '전사'
    STR = '전략·경영'
    MKT = '고객·시장'
    PRD = '제품·성장'
    SAL = '세일즈·마케팅'
    FIN = '재무·가격'
    TEC = '기술·데이터'
    RSK = '리스크·운영'
}

function Test-IsoDate {
    param([string]$Value)

    $parsed = [datetime]::MinValue
    return [datetime]::TryParseExact(
        $Value,
        'yyyy-MM-dd',
        [System.Globalization.CultureInfo]::InvariantCulture,
        [System.Globalization.DateTimeStyles]::None,
        [ref]$parsed
    )
}

function Assert-RecordMetadata {
    param(
        [object]$Metadata,
        [string]$Source
    )

    if ($null -eq $Metadata) { return }
    foreach ($field in @('schema_version', 'id', 'type', 'role', 'status', 'updated_at')) {
        if (($null -eq $Metadata.PSObject.Properties[$field]) -or [string]::IsNullOrWhiteSpace([string]$Metadata.$field)) {
            throw "Record metadata field '$field' is required: $Source"
        }
    }
    if ([string]$Metadata.schema_version -ne '1.0') { throw "Unsupported record schema version: $Source" }
    if ([string]$Metadata.id -notmatch '^[A-Z0-9][A-Z0-9_-]{2,63}$') { throw "Invalid record metadata ID: $Source" }
    if (-not $typeLabels.Contains([string]$Metadata.type)) { throw "Invalid record metadata type '$($Metadata.type)': $Source" }
    if (-not $roleLabels.Contains([string]$Metadata.role)) { throw "Invalid record metadata role '$($Metadata.role)': $Source" }
    if (-not (Test-IsoDate ([string]$Metadata.updated_at))) { throw "Invalid record updated_at: $Source" }
    if (($null -ne $Metadata.PSObject.Properties['created_at']) -and -not [string]::IsNullOrWhiteSpace([string]$Metadata.created_at) -and -not (Test-IsoDate ([string]$Metadata.created_at))) { throw "Invalid record created_at: $Source" }
    if (($null -ne $Metadata.PSObject.Properties['due_at']) -and -not [string]::IsNullOrWhiteSpace([string]$Metadata.due_at) -and -not (Test-IsoDate ([string]$Metadata.due_at))) { throw "Invalid record due_at: $Source" }
}

$catalog = [System.Collections.Generic.List[object]]::new()
$detailRecords = [System.Collections.Generic.List[object]]::new()
$usedIds = @{}

function Add-Record {
    param(
        [string]$Id,
        [string]$Type,
        [string]$Role,
        [string]$Title,
        [string]$Summary,
        [string]$Status,
        [string]$Priority,
        [string]$Date,
        [string]$Due,
        [string]$Source,
        [System.Collections.IDictionary]$Fields,
        [string]$BodyHtml = '',
        [string[]]$RelatedIds = @(),
        [string]$SearchContent = ''
    )

    $recordId = $Id.Trim()
    if ([string]::IsNullOrWhiteSpace($recordId)) {
        $recordId = 'REC-' + (Get-ShortHash ($Source + $Title))
    }
    if ($usedIds.ContainsKey($recordId)) { throw "Duplicate record ID '$recordId': $Source" }
    $usedIds[$recordId] = $true

    $safeName = ([regex]::Replace($recordId.ToLowerInvariant(), '[^a-z0-9가-힣_-]+', '-')).Trim('-')
    if ([string]::IsNullOrWhiteSpace($safeName)) { $safeName = 'record-' + (Get-ShortHash $recordId) }
    $detailHref = "records/$safeName.html"
    $typeLabel = if ($typeLabels.Contains($Type)) { $typeLabels[$Type] } else { $Type }
    $roleLabel = if ($roleLabels.Contains($Role)) { $roleLabels[$Role] } else { $Role }
    $sourceFullPath = Join-Path $projectRoot $Source
    if (-not (Test-Path -LiteralPath $sourceFullPath)) { throw "Record source not found: $Source" }
    $sourceHash = Get-ShortHash ([System.IO.File]::ReadAllText($sourceFullPath, [System.Text.Encoding]::UTF8)) 12
    $searchText = @($recordId, $typeLabel, $roleLabel, $Title, $Summary, $Status, $Priority, $Date, $Due, $Source, $sourceHash, ($Fields.Values -join ' '), $SearchContent) -join ' '

    $catalog.Add([pscustomobject][ordered]@{
        id = $recordId
        type = $Type
        typeLabel = $typeLabel
        role = $Role
        roleLabel = $roleLabel
        title = $Title
        summary = $Summary
        status = $Status
        priority = $Priority
        date = $Date
        due = $Due
        source = $Source.Replace('\', '/')
        sourceHash = $sourceHash.ToLowerInvariant()
        href = $detailHref
        relatedIds = @($RelatedIds)
        searchText = $searchText
    })
    $detailRecords.Add([pscustomobject]@{
        Id = $recordId
        Type = $Type
        TypeLabel = $typeLabel
        Role = $Role
        RoleLabel = $roleLabel
        Title = $Title
        Summary = $Summary
        Status = $Status
        Priority = $Priority
        Date = $Date
        Due = $Due
        Source = $Source
        SourceHash = $sourceHash.ToLowerInvariant()
        Href = $detailHref
        Fields = $Fields
        BodyHtml = $BodyHtml
        RelatedIds = @($RelatedIds)
    })
}

$documentFiles = @(
    Get-ChildItem -LiteralPath (Join-Path $projectRoot 'control'), (Join-Path $projectRoot 'personas'), (Join-Path $projectRoot 'system') -Recurse -File -Filter '*.md' |
        Sort-Object FullName
)

foreach ($file in $documentFiles) {
    $relativePath = Convert-ToRelativePath $file.FullName
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $metadata = Get-RecordMetadata $content
    Assert-RecordMetadata $metadata $relativePath
    $title = Get-DocumentTitle $content $file.BaseName
    $summary = Get-DocumentSummary $content
    $role = if (($null -ne $metadata) -and ($null -ne $metadata.PSObject.Properties['role']) -and -not [string]::IsNullOrWhiteSpace([string]$metadata.role)) { [string]$metadata.role } else { Get-RoleFromPath $relativePath }
    $type = Get-DocumentType $relativePath $title $metadata
    $id = if (($null -ne $metadata) -and ($null -ne $metadata.PSObject.Properties['id'])) { [string]$metadata.id } else { 'DOC-' + (Get-ShortHash $relativePath) }
    $status = Get-DocumentStatus $content $metadata
    $priority = if (($null -ne $metadata) -and ($null -ne $metadata.PSObject.Properties['priority'])) { [string]$metadata.priority } else { '-' }
    $date = Get-DocumentDate $content $metadata
    $related = if (($null -ne $metadata) -and ($null -ne $metadata.PSObject.Properties['related_ids'])) { @($metadata.related_ids) } else { @() }
    $fields = [ordered]@{
        '자료 유형' = if ($typeLabels.Contains($type)) { $typeLabels[$type] } else { $type }
        '담당 영역' = if ($roleLabels.Contains($role)) { $roleLabels[$role] } else { $role }
        '기준일' = $date
        '정본 경로' = $relativePath.Replace('\', '/')
    }
    $due = if (($null -ne $metadata) -and ($null -ne $metadata.PSObject.Properties['due_at']) -and -not [string]::IsNullOrWhiteSpace([string]$metadata.due_at)) { [string]$metadata.due_at } else { '-' }
    Add-Record -Id $id -Type $type -Role $role -Title $title -Summary $summary -Status $status -Priority $priority -Date $date -Due $due -Source $relativePath -Fields $fields -BodyHtml (Convert-MarkdownDocumentToHtml $content) -RelatedIds $related -SearchContent $content
}

$personaDirectories = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'personas') -Directory | Where-Object { $_.Name -match '^0\d_' }
foreach ($directory in $personaDirectories) {
    $role = Get-RoleFromPath ("personas\$($directory.Name)\inbox.md")
    $inboxPath = Join-Path $directory.FullName 'inbox.md'
    foreach ($row in @(Get-MarkdownTableRows $inboxPath 'Task Inbox')) {
        $fields = [ordered]@{
            '질문·변경' = [string]$row.'질문·변경'
            '기대 산출물' = [string]$row.'기대 산출물'
            '완료 기준' = [string]$row.'완료 기준'
            '목표일' = [string]$row.'목표일'
            '완료일' = [string]$row.'완료일'
            '관련 정본' = [string]$row.'관련 정본'
        }
        Add-Record -Id ([string]$row.'ID') -Type 'task' -Role $role -Title ([string]$row.'질문·변경') -Summary ([string]$row.'기대 산출물') -Status ([string]$row.'상태') -Priority '-' -Date ([string]$row.'입력일') -Due ([string]$row.'목표일') -Source (Convert-ToRelativePath $inboxPath) -Fields $fields
    }

    $updatesPath = Join-Path $directory.FullName 'updates.md'
    foreach ($row in @(Get-MarkdownTableRows $updatesPath)) {
        $taskIds = @(([string]$row.'과업 ID') -split '·' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
        $updateKey = ([string]$row.'날짜') + '|' + ([string]$row.'과업 ID') + '|' + ([string]$row.'완료·변경')
        $fields = [ordered]@{
            '과업 ID' = [string]$row.'과업 ID'
            '완료·변경' = [string]$row.'완료·변경'
            '결과' = [string]$row.'결과'
            '다음 단계' = [string]$row.'다음 단계'
            '근거' = [string]$row.'근거'
        }
        Add-Record -Id ("UPD-$role-" + (Get-ShortHash $updateKey 8)) -Type 'update' -Role $role -Title ([string]$row.'완료·변경') -Summary ([string]$row.'결과') -Status ([string]$row.'상태') -Priority '-' -Date ([string]$row.'날짜') -Due '-' -Source (Convert-ToRelativePath $updatesPath) -Fields $fields -RelatedIds $taskIds
    }
}

function Add-TableRecords {
    param(
        [string]$RelativePath,
        [string]$Heading,
        [string]$Type,
        [string]$IdColumn,
        [string]$TitleColumn,
        [string]$SummaryColumn,
        [string]$StatusColumn,
        [string]$DateColumn,
        [string]$PriorityColumn,
        [string]$DueColumn,
        [string]$IdPrefix
    )

    $fullPath = Join-Path $projectRoot $RelativePath
    foreach ($row in @(Get-MarkdownTableRows $fullPath $Heading)) {
        $title = [string]$row.$TitleColumn
        $id = if (-not [string]::IsNullOrWhiteSpace($IdColumn) -and -not [string]::IsNullOrWhiteSpace([string]$row.$IdColumn)) { [string]$row.$IdColumn } else { $IdPrefix + (Get-ShortHash $title 8) }
        $summary = if (-not [string]::IsNullOrWhiteSpace($SummaryColumn)) { [string]$row.$SummaryColumn } else { $title }
        $status = if (-not [string]::IsNullOrWhiteSpace($StatusColumn)) { [string]$row.$StatusColumn } else { '기록' }
        $date = if (-not [string]::IsNullOrWhiteSpace($DateColumn)) { [string]$row.$DateColumn } else { '미확인' }
        $priority = if (-not [string]::IsNullOrWhiteSpace($PriorityColumn)) { [string]$row.$PriorityColumn } else { '-' }
        $due = if (-not [string]::IsNullOrWhiteSpace($DueColumn)) { [string]$row.$DueColumn } else { '-' }
        $fields = [ordered]@{}
        foreach ($property in $row.PSObject.Properties) { $fields[$property.Name] = [string]$property.Value }
        Add-Record -Id $id -Type $Type -Role 'ALL' -Title $title -Summary $summary -Status $status -Priority $priority -Date $date -Due $due -Source $RelativePath -Fields $fields
    }
}

Add-TableRecords -RelativePath 'control\08_decision_log.md' -Heading '결정 목록' -Type 'decision' -IdColumn 'ID' -TitleColumn '결정' -SummaryColumn '주요 결과' -StatusColumn '상태' -DateColumn '날짜' -PriorityColumn '' -DueColumn '' -IdPrefix 'DEC-'
Add-TableRecords -RelativePath 'control\08_decision_log.md' -Heading '제안 상태의 결정' -Type 'decision' -IdColumn 'ID' -TitleColumn '제안' -SummaryColumn '결정에 필요한 증거' -StatusColumn '상태' -DateColumn '' -PriorityColumn '' -DueColumn '' -IdPrefix 'PRP-'
Add-TableRecords -RelativePath 'control\00_project_status.md' -Heading '다음 의사결정' -Type 'question' -IdColumn 'ID' -TitleColumn '결정' -SummaryColumn '필요한 증거' -StatusColumn '상태' -DateColumn '' -PriorityColumn '' -DueColumn '결정 시점' -IdPrefix 'QUE-'
Add-TableRecords -RelativePath 'control\00_project_status.md' -Heading '상위 리스크' -Type 'risk' -IdColumn 'ID' -TitleColumn '리스크' -SummaryColumn '현재 영향' -StatusColumn '상태' -DateColumn '' -PriorityColumn '등급' -DueColumn '' -IdPrefix 'BRK-'
Add-TableRecords -RelativePath 'control\00_project_status.md' -Heading '핵심 지표' -Type 'metric' -IdColumn 'ID' -TitleColumn '지표' -SummaryColumn '90일 목표·통과 기준' -StatusColumn '현재' -DateColumn '' -PriorityColumn '' -DueColumn '' -IdPrefix 'KPI-'
Add-TableRecords -RelativePath 'control\00_project_status.md' -Heading '지금 할 일' -Type 'plan' -IdColumn 'ID' -TitleColumn '행동' -SummaryColumn '완료 조건' -StatusColumn '상태' -DateColumn '' -PriorityColumn '우선순위' -DueColumn '목표일' -IdPrefix 'ACT-'
Add-TableRecords -RelativePath 'control\15_execution_control.md' -Heading '30일 실행' -Type 'plan' -IdColumn 'ID' -TitleColumn '단계' -SummaryColumn '실행' -StatusColumn '상태' -DateColumn '' -PriorityColumn '' -DueColumn '기간' -IdPrefix 'PLN-'
Add-TableRecords -RelativePath 'control\09_validation_board.md' -Heading '핵심 가설' -Type 'hypothesis' -IdColumn 'ID' -TitleColumn '가설' -SummaryColumn '시험' -StatusColumn '상태' -DateColumn '' -PriorityColumn '우선순위' -DueColumn '' -IdPrefix 'HYP-'

foreach ($record in $detailRecords) {
    foreach ($relatedId in $record.RelatedIds) {
        if (-not $usedIds.ContainsKey([string]$relatedId)) {
            throw "Related record ID '$relatedId' not found: $($record.Id)"
        }
    }
}

$navItems = @(
    @{ Id = 'overview'; Short = '전체'; Label = '전체 현황'; Href = '../index.html' },
    @{ Id = 'STR'; Short = 'STR'; Label = '전략·경영'; Href = '../pages/str.html' },
    @{ Id = 'MKT'; Short = 'MKT'; Label = '고객·시장'; Href = '../pages/mkt.html' },
    @{ Id = 'PRD'; Short = 'PRD'; Label = '제품·성장'; Href = '../pages/prd.html' },
    @{ Id = 'SAL'; Short = 'SAL'; Label = '세일즈·마케팅'; Href = '../pages/sal.html' },
    @{ Id = 'FIN'; Short = 'FIN'; Label = '재무·가격'; Href = '../pages/fin.html' },
    @{ Id = 'TEC'; Short = 'TEC'; Label = '기술·데이터'; Href = '../pages/tec.html' },
    @{ Id = 'RSK'; Short = 'RSK'; Label = '리스크·운영'; Href = '../pages/rsk.html' }
)
$navHtml = ($navItems | ForEach-Object { '<a class="nav-link" href="' + $_.Href + '"><span>' + $_.Short + '</span><strong>' + $_.Label + '</strong></a>' }) -join "`n"
$generatedAt = @($detailRecords | ForEach-Object { $_.Date } | Where-Object { [string]$_ -match '^20\d{2}-\d{2}-\d{2}$' } | Sort-Object -Descending | Select-Object -First 1)[0]
if ([string]::IsNullOrWhiteSpace($generatedAt)) { $generatedAt = '미확인' }
$recordHrefById = @{}
foreach ($item in $detailRecords) { $recordHrefById[$item.Id] = $item.Href }

foreach ($record in $detailRecords) {
    $fieldRows = foreach ($entry in $record.Fields.GetEnumerator()) {
        '<div><dt>' + [System.Net.WebUtility]::HtmlEncode([string]$entry.Key) + '</dt><dd>' + (Convert-InlineMarkdown ([string]$entry.Value)) + '</dd></div>'
    }
    $relatedHtml = if ($record.RelatedIds.Count -gt 0) {
        $relatedLinks = foreach ($relatedId in $record.RelatedIds) {
            if ($recordHrefById.ContainsKey($relatedId)) {
                '<a href="' + [System.IO.Path]::GetFileName([string]$recordHrefById[$relatedId]) + '">' + [System.Net.WebUtility]::HtmlEncode($relatedId) + '</a>'
            }
            else {
                '<span>' + [System.Net.WebUtility]::HtmlEncode($relatedId) + '</span>'
            }
        }
        '<div class="record-related"><strong>연결 ID</strong><div>' + ($relatedLinks -join '') + '</div></div>'
    }
    else { '' }
    $body = if ([string]::IsNullOrWhiteSpace($record.BodyHtml)) {
        '<section class="panel record-fields"><div class="section-heading"><div><p>등록 내용</p><h2>세부 항목</h2></div></div><dl>' + ($fieldRows -join "`n") + '</dl></section>'
    }
    else {
        '<section class="panel record-document"><div class="section-heading"><div><p>정본 내용</p><h2>문서 보기</h2></div></div><article class="markdown-body">' + $record.BodyHtml + '</article></section>'
    }
    $sourceHref = '../../' + $record.Source.Replace('\', '/')
    $document = @"
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>$([System.Net.WebUtility]::HtmlEncode($record.Title)) · BIGSEE</title>
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body data-page="record">
  <button class="mobile-nav-button" type="button" data-nav-toggle aria-controls="primary-navigation" aria-expanded="false"><span>메뉴</span><strong>자료 상세</strong></button>
  <div class="app-shell">
    <aside class="sidebar" id="primary-navigation">
      <a class="brand" href="../index.html"><strong>BIGSEE</strong><span>사업 운영</span></a>
      <nav class="primary-nav" aria-label="대시보드 화면">$navHtml</nav>
      <div class="sidebar-meta"><span>자료 ID</span><strong>$([System.Net.WebUtility]::HtmlEncode($record.Id))</strong><small>$([System.Net.WebUtility]::HtmlEncode($record.TypeLabel))</small></div>
    </aside>
    <div class="page-shell">
      <main>
        <header class="page-header record-header">
          <div><p>$([System.Net.WebUtility]::HtmlEncode($record.RoleLabel)) · $([System.Net.WebUtility]::HtmlEncode($record.TypeLabel))</p><h1>$([System.Net.WebUtility]::HtmlEncode($record.Title))</h1><span>$([System.Net.WebUtility]::HtmlEncode($record.Summary))</span></div>
          <dl><div><dt>상태</dt><dd>$([System.Net.WebUtility]::HtmlEncode($record.Status))</dd></div><div><dt>기준일</dt><dd>$([System.Net.WebUtility]::HtmlEncode($record.Date))</dd></div></dl>
        </header>
        <section class="record-meta" aria-label="자료 정보">
          <div><span>자료 ID</span><strong>$([System.Net.WebUtility]::HtmlEncode($record.Id))</strong></div>
          <div><span>담당</span><strong>$([System.Net.WebUtility]::HtmlEncode($record.RoleLabel))</strong></div>
          <div><span>우선순위</span><strong>$([System.Net.WebUtility]::HtmlEncode($record.Priority))</strong></div>
          <div><span>목표일</span><strong>$([System.Net.WebUtility]::HtmlEncode($record.Due))</strong></div>
        </section>
        $relatedHtml
        $body
        <section class="panel record-source"><div class="section-heading"><div><p>원본</p><h2>원본 자료</h2></div><span class="section-note">검증 $([System.Net.WebUtility]::HtmlEncode($record.SourceHash))</span></div><a href="$([System.Net.WebUtility]::HtmlEncode($sourceHref))">$([System.Net.WebUtility]::HtmlEncode($record.Source.Replace('\', '/')))</a><p>내용 수정은 원본 Markdown에서만 하고 대시보드를 다시 생성합니다.</p></section>
      </main>
      <footer><span>자료 기준 $generatedAt · 정적 상세 화면</span></footer>
    </div>
  </div>
  <div class="nav-backdrop" data-nav-close></div>
  <script src="../assets/app.js"></script>
</body>
</html>
"@
    $outputPath = Join-Path $dashboardRoot $record.Href.Replace('/', '\')
    [System.IO.File]::WriteAllText($outputPath, $document, $utf8NoBom)
}

$catalogArray = @($catalog | Sort-Object @{ Expression = { if ([string]$_.date -match '^20\d{2}-\d{2}-\d{2}$') { [string]$_.date } else { '0000-00-00' } }; Descending = $true }, @{ Expression = { $_.id }; Descending = $false })
$catalogJson = ConvertTo-Json -InputObject $catalogArray -Depth 6 -Compress
[System.IO.File]::WriteAllText((Join-Path $dataRoot 'catalog.js'), "window.BIGSEE_CATALOG=$catalogJson;", $utf8NoBom)

$manifest = [ordered]@{
    schemaVersion = '1.0'
    generatedAt = $generatedAt
    sourceDocuments = $documentFiles.Count
    records = $catalogArray.Count
    relationships = @($detailRecords | ForEach-Object { $_.RelatedIds }).Count
    types = @($catalogArray | Group-Object type | Sort-Object Name | ForEach-Object { [ordered]@{ type = $_.Name; count = $_.Count } })
    roles = @($catalogArray | Group-Object role | Sort-Object Name | ForEach-Object { [ordered]@{ role = $_.Name; count = $_.Count } })
}
[System.IO.File]::WriteAllText((Join-Path $dataRoot 'manifest.json'), (ConvertTo-Json $manifest -Depth 6), $utf8NoBom)

if ($catalogArray.Count -le $documentFiles.Count) { throw 'Structured catalog records were not generated' }
if ((Get-ChildItem -LiteralPath $recordsRoot -File -Filter '*.html').Count -ne $catalogArray.Count) { throw 'Record detail page count mismatch' }
if (@($catalogArray | Group-Object id | Where-Object { $_.Count -gt 1 }).Count -gt 0) { throw 'Duplicate catalog record IDs found' }

Write-Output "Data catalog generated: $($documentFiles.Count) source documents / $($catalogArray.Count) records / $($catalogArray.Count) detail pages"
