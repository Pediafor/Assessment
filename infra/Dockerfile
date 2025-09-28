# Infrastructure Tools Dockerfile
FROM alpine:3.18

# Install common infrastructure tools
RUN apk add --no-cache \
    kubectl \
    helm \
    terraform \
    curl \
    jq \
    bash

WORKDIR /workspace

CMD ["/bin/bash"]