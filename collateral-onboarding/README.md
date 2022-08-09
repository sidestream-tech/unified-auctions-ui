# Automatic collateral onboarding

The script runs the necessary operations to onboard the collateral.

## Running

__Enironment variables__

One has to specify `ALCHEMY_URL` variable in the `.env` file that points the hardhat to the fork url.
The `.env` file is to be located next to the `docker-compose.yml` file.

__Command__

```sh
> docker-compose up --build --force-recreate
```




## Possible issues

### M1 architecture

Depending on the architecture one should run the containers in the compatability mode because the issues related to arm architecture arise otherwise.
This narrows down to adding/removing the docker-compose directive `platform: linux/amd64`. If one desires to run the docker container separately then the
flag has to be provided along with the rest of the `docker build` command: `--platform linux/amd64`
