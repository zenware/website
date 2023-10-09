+++
title = "Google BeyondCorp Notes - Paper 1"
description = "How google implemented a zero trust architecture."
date = 2023-10-09
draft = false

[taxonomies]
tags = ["zerotrust","cybersecurity"]
[extra]
keywords = "BeyondCorp, Zero Trust, Google, Network Perimiter, Access Controls, Authorization"
toc = true
series = "BeyondCorp"
+++

This article is just notes I took while reading the first BeyondCorp[^beyondcorp] paper.
<!-- more -->
## BeyondCorp: A New Approach to Enterprise Security[^beyondcorp1]

### Introduction

- Historically people used perimiter security like "firewalls"
- Now mobile devices and "the cloud" exists and the idea of a perimiter is far less meaningful
- Google started moving interal applications to "The Internet"

Key Assmptions of Perimeter Security Model are no longer true
Perimeter is no longer the physical location of an enterprise, inside the perimeter is not some blessed safe space for personal devices or enterprise apps

> While most enterprises assume that the internal network is a safe environment in which to expose corporate applications, Google’s experience has proven that this faith is misplaced. Rather, one should assume that an internal network is as fraught with danger as the public Internet and build enterprise applications based upon this assumption

> Google’s BeyondCorp initiative is moving to a new model that dispenses with a privileged corporate network. Instead, access depends solely on device and user credentials, regard-less of a user’s network location—be it an enterprise location, a home network, or a hotel or coffee shop. All access to enterprise resources is fully authenticated, fully authorized, and fully encrypted based upon device state and user credentials.

### Major Components of BeyondCorp

1. Securely Identifying the Device
2. Securely Identifying the User
3. Removing Trust from the Network
4. Externalizing Applications and Workflows
5. Implementing Inventory-Based Access Control

#### Securely Identifying the Device

- Device Inventory Database
  - Managed devices are the only devices allowed to access corp apps
  - Device tracking processes are required
- Device Identity
  - Unique ID Reference in Device ID DB
  - Device Certificates provisioned to TPM or other "Qualified" Certificate Store
  - Certificate is used for all communication to enterprise services

#### Securely Identifying the User

- User and Group Database
  - Integrated with HR processes to manage Job Categories, Usernames, and Group Membership
  - The roles and responsibilities defined here informs access for the BeyondCorp system
- Single Sign-On System
  - Central User Auth Portal validates MFA to access enterprise resources
  - Validates against User Database and Group Database
  - Generates time limited, resource specific, authorization tokens

#### Remove Trust from the Network

- Deployment of an Unprivileged Network
  - Intended to replicate an external network
  - Limited Network Access (DNS, DHCP, NTP, Config Management)
  - All client devices in a Google building are 'assigned' to this network
  - Strictly managed ACL between this and other Google networks
- 802.1x Authentication on Wired and Wireless Network Access
  - Dynamic VLAN Assignment with RADIUS assigns users to an appropriate network
  - Managed devices provide their certificate for the 802.1x Handshake
  - Unmanaged / Unrecognized devices are assigned a remediation network

#### Externalizing Applications and Workflows

- Internet-Facing Access Proxy
  - All enterprise apps are exposed to clients via an Internet-facing access proxy to enforce encryption
  - Each app has it's own proxy config with features like load balancing, health checks, etc.
  - Proxy requests are delegated to the appropriate back-end app after access control checks
- Public DNS Entries
  - All enterprise apps are exposed externally and registered in public DNS
  - CNAME points to the access proxy

#### Implementing Inventory-Based Access Control

- Trust Inference for Devices and Users
  - Access levels will change over time
  - Trust level is dynamically inferred from multiple sources
  - New access locations or being on an old patch can reduce trust
- Access Control Engine
  - This lives in the access proxy and authorizes users to individual services
  - Accounts for user, groups, device cert, and Device Inventory Database
  - Occasionally will involve location-based restrictions
  - Different parts of the same application can have different restrictions
- Pipeline into the Access Control Engine
  - Dynamically extracted info is fed into ACE
  - Certificate white-lists, device and user trust levels, etc.

---
<!-- Note: There must be a blank line every two lines of the footnote definition. -->
[^beyondcorp]: [BeyondCorp](https://cloud.google.com/beyondcorp/)

[^beyondcorp1]: [BeyondCorp: A New Approach to Enterprise Security](https://research.google/pubs/pub43231/)
