import type { Message, MessageOptions } from 'ant-design-vue/types/message';
import { message } from 'ant-design-vue';

const notifier = function (messageType: keyof Message, messageOptions: MessageOptions | string): void {
    (message as any)[messageType](messageOptions);
};

export default notifier;
