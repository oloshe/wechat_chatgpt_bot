# 微信 ChatGPT 自动回复机器人

基于 `wechaty` 和 `chatgpt` 的微信自动回复机器人 `Node.js` 脚本。

# 部署步骤

1. 克隆本仓库代码
2. 在根目录创建 `.env` 文件，写入以下内容

```
OPENAI_API_KEY=<替换成你自己openai账号的api_key>
MODEL=text-chat-davinci-002-20221122
CACHE_FILE=cache.json
RESPONSE_PREFIX=🤖️
```

3. 执行代码 `node main.js` 扫码登陆即可

# 使用说明

部署完成后在聊天内容里如果以冒号开头（中英都可以），则会触发ChatGPT机器人回复。例如：

```
:hello, colon
```
```
：你好，冒号
```