# Auction-UI Helm Chart

This is the helm chart of auction-ui.

## Deployment

This chart supports deployment to different environments. The environments are defined via the `values.override_X.yaml` files, where `X` is the target host/environment that the overrides are for.

To deploy this chart:
1. Create the `secrets.yaml` file:
    ```sh
    > aws-vault exec YOUR_AWS_USERNAME -- chamber read --quiet auction-ui secrets.yaml | base64 -d > secrets.yaml
    ```
2. Deploy to for your desired environment X (replace X with your environment!):
    ```sh
    > helm upgrade --install --wait --create-namespace --namespace auction-ui -f values.yaml -f values.override_X.yaml -f secrets.yaml auction-ui .
    ```
3. Check the running pods (aka. containers) status of the application:
    ```sh
    > kubectl get pods --namespace auction-ui
    ```
4. Undeploy the application
    ```sh
    > helm uninstall --namespace auction-ui auction-ui
    ```
