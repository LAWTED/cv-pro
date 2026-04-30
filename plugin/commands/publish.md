---
description: Publish a resume update from a local PDF or from the current conversation context.
---

If the user attached a PDF, read it and extract the full `ResumeData` shape, then call the cv MCP server's `update_resume` tool with the result. Otherwise, infer their intent from the conversation and either call `update_resume` or `update_section` as appropriate. Confirm by quoting the new version number returned by the server.
