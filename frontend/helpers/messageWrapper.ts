/* eslint-disable @typescript-eslint/no-floating-promises */

import type { Message, ConfigType, ConfigDuration, ConfigOnClose } from 'ant-design-vue/types/message';
import { message as antdMessage } from 'ant-design-vue';

type Modify<T, R> = Omit<T, keyof R> & R;

export type WrappedMessage = Modify<
    Message,
    {
        success(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
        warning(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
        warn(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
        info(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
        error(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
        loading(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    }
>;

export const message: WrappedMessage = {
    ...antdMessage,
    success: (content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
        antdMessage.success(content, duration, onClose);
    },
    warning: (content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
        antdMessage.warning(content, duration, onClose);
    },
    warn: (content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
        antdMessage.warn(content, duration, onClose);
    },
    info: (content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
        antdMessage.info(content, duration, onClose);
    },
    error: (content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
        antdMessage.error(content, duration, onClose);
    },
    loading: (content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose) => {
        antdMessage.loading(content, duration, onClose);
    },
};
