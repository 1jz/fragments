POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# Set wrong type
Content-Type: applcation/xml
```This is a fragment!```

# 1. We expect to get back an HTTP 201
HTTP/1.1 415
