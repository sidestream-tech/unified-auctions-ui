import { message } from 'ant-design-vue';

const notifier = function (messageType: string, messageContent: any) {
    message[messageType](messageContent);
};

export default notifier;
