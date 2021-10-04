export default abstract class AbstractWallet {
    public static title: string;
    public static icon: object;
    public static downloadUrl: string;
    public static isInterfaceReady: boolean;
    public static isConnected: boolean;
    public static isLoggedIn: boolean;

    public abstract address?: string;
    public abstract connect(): Promise<void>;
    public abstract switchNetwork(network: string): Promise<void>;
    public abstract setup(): void;
    public abstract teardown(): void;

    public disconnect(): void {
        this.teardown();
    }
}
