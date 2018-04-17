---
layout: page
title: Core On A Page
subtitle: Creating a Juniper MPLS core using RSVP as the LDP and ISIS as the IGP. The brief assumes no current need for Traffic Engineering
image: /img/mpls.jpg
bigimg: /img/bigimg/blur.jpg
---
The below is the basics for a MPLS core to use in a lab. It only scratches the surface, but a good start if you want a MPLS core network to start swapping out the IGP or the LDP, adding CoS, VRFs, RSVP-TE, peering’s or inter-AS services and VPNs (option [A]( https://www.juniper.net/documentation/en_US/junose16.1/topics/concept/mbgp-inter-as-option-a-overview.html), [B]( https://www.juniper.net/documentation/en_US/junose16.1/topics/concept/mbgp-inter-as-option-b-overview.html) or [C]( https://www.juniper.net/documentation/en_US/junose16.1/topics/concept/mbgp-inter-as-option-c-overview.html))

# Autonomous System
* Configure a suitable `autonomous-system` under `routing-options`

# Configure MPLS
* Configure all the core link `interfaces` with a suitable IP `address` under `family inet`
* Configure all the core link `interfaces` with `family mpls` under the `unit`
* Set a suitable MTU size for the core trunk `interfaces`
* Configure all the core link interfaces under `protocols mpls`
* Set `no-propogate-ttl` at `protocols mpls` stanza level to disable normal time-to-live (TTL) decrementing (sets a MPLS header with a TTL value of 255)
* Add the `label-switched-path` (s) - used for path signalling - under `protocols mpls`. For pre signalling with set paths then add a primary (strict), secondary (strict) and tertiary (loose) path. The primary, secondary and tertiary paths are set under `protocols mpls` path with IP of trunk hops and destination. Set `no-cspf` on each `label-switched-path` to disable constrained-path LSP computation (cspf is used if the core network is setup to use Traffic Engineering).
* LSPs are unidirectional so need to be defined on all the ingress routers for all primary and secondary paths.
* Optional: (`fast-reroute` provides a mechanism for automatically rerouting traffic on an LSP if a node or link in an LSP fails, thus reducing the loss of packets traveling over the LSP. Configure under the defined LSPs. Check pre-requisites for `fast-reroute` before configuring.

# Configure the Label Distribution Protocol using RSVP (or LDP)
* This brief assumes the use of RSVP in its simplest form – not being used with traffic engineering but note that RSVP has this capability for future growth or TE requirements
* RSVP uses unidirectional and simplex flows through the network to perform its function. The inbound router initiates an RSVP path message and sends it downstream to the outbound router. The path message contains information about the resources needed for the connection. Each router along the path begins to maintain information about a reservation
* RSVP is not a routing protocol – it needs an IGP (ISIS or OSPF) to determine paths
* Add interfaces to `protocols rsvp`

# Configure an IGP to determine best paths for LSPs using ISIS (or OSPF)
* ISIS is an IGP to determine best paths
* One flat Level 2 area can be used
* Set level 2 auth’ (md5) and `wide-metrics-only` (generate metric values greater than 63 on a per ISIS level basis) at `protocols isis` stanza level
* Set interfaces `level 1 disable` as appropriate – set `level 2 passive` on management and loopback
* Set `bfd-liveness-detection` on trunks to core devices to configure bidirectional failure detection timers for ISIS
* Add `family iso` on core trunk interfaces and loopback
* Add a NET (Network Entity Title) `address` under `family iso` on the loopback `unit 0`
* For example, the NET address `49.0001.1921.6800.1001.00` consists of the following parts:

|AFI|Area ID|System Identifier|Selector|
|:---:|:---:|:---:|:---:|
|49|0001|1921.6800.1001|00|

# Configure the internal BGP
* iBGP full mesh or route reflection – two route reflectors is ideal
* For full mesh set `type` and `local-address` and `family` and all `neighbor`(s) + optionally (recommended) an `authentication-key`
* For a route reflector set all the above BUT for RR clients with just the one (or more) route reflectors as neighbors and then on the reflectors set the `cluster` (which is the same as the local address) with all the other non-route reflector neighbors.

# Configure the Class of Service
* Firewall filters
* Policers
* Classifiers
* Code point aliases
* Drop profiles
* Forwarding classes
* Traffic control profiles
* Rewrite rules
* Interfaces
* Scheduler maps
* Schedulers
* Note: for M and T series routers with IQ2 cards. If more than 128 units on an interface ensure that the scheduler mapping is configured to use more than 128 schedulers. To check:
`request pfe execute pic-slot <#> target fpc<#> command "show tmdrv scheduler-partition"`

# Other settings
* Radius, banner, users, ssh, syslog, ntp, rpm
* Protect RE firewall filter on the loopback (made of associated prefix lists, policers, addresses, protocols and ports). [Securing the Routing Engine PDF](http://www.hiphop-resistance.com/juniperdayone/Securing_RouteEngine2.pdf)
* Backup-router settings (for dual RE)
* It is recommended to filter out unnecessary log messages that can cause log bloat or unnecessary load on syslog or monitoring systems: [Juniper KB Article](https://kb.juniper.net/InfoCenter/index?page=content&id=KB9382)
* Example below that was used on devices that performed RPM was used to just filter RPM test completion messages at very short intervals filling up logs very quickly: To set use:
`set system syslog file messages match "!(.*DAEMON-6-PING_TEST_COMPLETED:.*)"`

# ISSU (In Service Software Upgrade)
## Chassis Redundancy settings
* feb redundancy group
* Redundancy, fpc-feb-connectivity 
* `graceful-switchover` (needed for ISSU)

## Routing Options
* `nonstop-routing` (needed for ISSU)

# VRF note
The difference between route distinguisher and route target
* The route distinguisher and route target values perform two completely separate functions, and although most press publications/websites show the values as the same (which they can be) it is confusing to someone learning MPLS for the first time as they assume they do the same thing. The route distinguisher makes a unique VPNv4 address across the MPLS network. The route target defines which prefixes get imported and exported on the PE routers

## Ideal Further Reading and Reference
* [Deploying Basic QoS Day One book](https://www.juniper.net/uk/en/training/jnbooks/day-one/fundamentals-series/deploying-basic-qos/)
* [Hardening Junos Devices Day One Book and Handy Checklist](https://www.juniper.net/uk/en/training/jnbooks/day-one/fundamentals-series/hardening-junos-devices-checklist/)
* [Good overview on Route Target and Distinguisher on Networkfuntimes](http://www.networkfuntimes.com/route-distinguishers-vs-route-targets-what-are-they-why-do-we-need-them-both/)
