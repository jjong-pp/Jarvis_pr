---
aliases: [옵시디언 MCP 에러 해결, 404 Namespace not found]
tags: [obsidian, mcp, troubleshooting, error]
created: 2026-06-21
status: ✅done
publish_to_notion: false
---

# Obsidian MCP 연결 트러블슈팅 (404 Error)

## 🚨 문제 상황
* 옵시디언과 AI(Claude/Cursor 등)를 MCP로 연동하려고 할 때 아래와 같은 에러가 발생함.
> `Error: 404 {"error":"Namespace not found"} : calling "initialize": EOF`

## 🔍 원인 분석
이 오류는 AI 클라이언트가 `mcp-obsidian` 브릿지를 통해 옵시디언의 **Local REST API 플러그인**에 접속하려 할 때 발생한다.
1. **보안/포트 문제:** 플러그인이 자체 HTTPS 인증서를 요구하거나 포트(27123 / 27124)가 차단되었을 때.
2. **호환성 버그:** 플러그인 업데이트로 인해 API 네임스페이스 경로(`/vault/` 등)가 변경되어, 외부 패키지(Smithery 등)가 길을 잃어버렸을 때 흔히 발생한다. (프로그램 앱에 네트워크로 접속하려는 방식의 한계)

## ✅ 해결 방법 (권장: 파일시스템 직접 연결)
불안정한 옵시디언 앱 API 연결 방식을 버리고, **공식 파일시스템 MCP 서버**를 이용해 옵시디언의 `.md` 텍스트 파일들이 저장된 로컬 볼트(Vault) 폴더를 AI가 "직접" 읽고 쓰도록 설정을 바꾼다.

### 설정 변경 방법
`mcpServers` 설정 파일(`claude_desktop_config.json` 등)의 내용을 아래와 같이 교체한다.

```json
{
  "mcpServers": {
    "obsidian-vault": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\MyMain\\autoplan\\SecondBrain"
      ]
    }
  }
}
```

### 💡 파일시스템 방식의 장점
* 복잡한 `apiKey`와 `port` 설정이 필요 없다.
* 옵시디언 프로그램이 꺼져(종료되어) 있어도 AI가 정상적으로 지식 그래프를 읽고 쓸 수 있다.
* 옵시디언의 백링크 체계는 결국 텍스트 안의 `[[ ]]` 문법이므로, AI의 내부 알고리즘이 이를 완벽하게 분석하고 해석할 수 있다.

---
**관련 문서:** [[AI_비서_구축]]
