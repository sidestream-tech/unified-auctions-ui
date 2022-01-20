# Auction-UI Helm Chart

This is the helm chart of auction-ui.

## Deployment

This chart supports deployment to the AWS Cluster and to a local development cluster with minimal changes in-between.

To deploy this chart:
1. Create the `secrets.yaml` file:
    - Staging:
        ```sh
        > aws-vault exec YOUR_AWS_USERNAME -- chamber read --quiet auction-ui/staging secrets_yaml | base64 -d > secrets.yaml
        ```
    - Production:
        ```sh
        > aws-vault exec YOUR_AWS_USERNAME -- chamber read --quiet auction-ui/production secrets_yaml | base64 -d > secrets.yaml
        ```
2. Deploy to:
    - Staging:
        ```sh
        > helm upgrade --install --wait --namespace auction-ui --create-namespace -f values.yaml -f values.override-staging.yaml -f secrets.yaml auction-ui .
        ```
    - Production:
        ```sh
        # Confusingly, the production namespace is indeed called `auction-ui-staging`
        > helm upgrade --install --wait --namespace auction-ui-staging --create-namespace -f values.yaml -f values.override-production.yaml -f secrets.yaml auction-ui .
        ```
3. Check the application status
    - Check running pods status (grouping of containers):
        ```sh
        > kubectl get pods --namespace auction-ui
        ```
4. Undeploy the application
    ```sh
    > helm uninstall --namespace auction-ui auction-ui
    ```
