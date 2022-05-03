/* eslint-disable @typescript-eslint/no-floating-promises */

import type {
    MessageOptions,
    MessageConfigOptions,
    ConfigType,
    ConfigDuration,
    ConfigOnClose,
} from 'ant-design-vue/types/message';
import { message as antdMessage } from 'ant-design-vue';

declare interface WrapperMessage {
    success(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    warning(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    warn(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    info(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    error(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    loading(content: ConfigType, duration?: ConfigDuration, onClose?: ConfigOnClose): void;
    open: (config: MessageOptions) => void;
    config: (options: MessageConfigOptions) => void;
    destroy: () => void;
}

export const message: WrapperMessage = {
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
    open: (config: MessageOptions) => {
        antdMessage.open(config);
    },
    config: (options: MessageConfigOptions) => {
        antdMessage.config(options);
    },
    destroy: () => {
        antdMessage.destroy();
    },
};
