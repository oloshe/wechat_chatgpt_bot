import { WechatyBuilder } from 'wechaty';
import ChatGPTClient from '@waylaidwanderer/chatgpt-api';
import { KeyvFile } from 'keyv-file';
import * as dotenv from 'dotenv'
import qrcodeTerminal from 'qrcode-terminal';
dotenv.config();

const chatGptClient = new ChatGPTClient(process.env.OPENAI_API_KEY, {
    // (Optional) Parameters as described in https://platform.openai.com/docs/api-reference/completions
    modelOptions: {
        // The model is set to text-chat-davinci-002-20221122 by default, but you can override
        // it and any other parameters here
        model: process.env.MODEL,
    },
    // (Optional) Set custom instructions instead of "You are ChatGPT...".
    // promptPrefix: 'You are Bob, a cowboy in Western times...',
    // (Optional) Set a custom name for the user
    // userLabel: 'User',
    // (Optional) Set a custom name for ChatGPT
    // chatGptLabel: 'ChatGPT',
    // (Optional) Set to true to enable `console.debug()` logging
    debug: false,
}, {
    // Options for the Keyv cache, see https://www.npmjs.com/package/keyv
    // This is used for storing conversations, and supports additional drivers (conversations are stored in memory by default)
    // For example, to use a JSON file (`npm i keyv-file`) as a database:
    store: new KeyvFile({ filename: 'cache.json' }),
})

const wechaty = WechatyBuilder.build();

/**
 * @type {Record<string, {
 *  conversationId: string
 *  messageId: string
 * }>}
 */
const cacheData = {};

const prefix = process.env.RESPONSE_PREFIX || '';

let userId = null;

wechaty
    .on('scan', (qrcode, status) => {
        // https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}
        console.log(`Scan QR Code to login: ${status}`)
        qrcodeTerminal.generate(qrcode, codeTerminalImg => {
            console.log(codeTerminalImg);
        });
    })
    .on('login', (user) => {
        console.log('Login successfully! ' + user);
        userId = user.id;
    })
    .on('message', async msg => {
        const talker = msg.talker()
        const listener = msg.listener();
        const text = msg.text()
        const room = msg.room()
        if (!text) { return };
        if (room) { return }
        if (text.startsWith(':') || text.startsWith('：')) {
            if (!cacheData[talker.id]) {
                cacheData[talker.id] = {};
            }
            const data = cacheData[talker.id]; // Cache
            const sendText = text.slice(1);
            console.log(`>>> ${sendText}`);
            const response = await chatGptClient.sendMessage(sendText, {
                conversationId: data.conversationId,
                parentMessageId: data.messageId,
            });
            // Save Cache
            data.conversationId = response.conversationId;
            data.messageId = response.messageId;
            console.log(`<<< ${response.response}`);
            if (talker.id === userId) {
                listener.say(prefix + response.response);
            } else {
                msg.say(prefix + response.response);
            }
        }
    });

wechaty.start();