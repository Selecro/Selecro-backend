path "transit/encrypt/{{id}}/*" {
  capabilities = ["create", "read"]
}
path "transit/decrypt/{{id}}/*" {
  capabilities = ["create", "read"]
}
path "auth/token/renew-self" {
    capabilities = ["update"]
}
path "auth/token/create" {
  capabilities = ["create"]
}
