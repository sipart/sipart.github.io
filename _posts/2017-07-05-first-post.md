---
layout: post
title: First Post!
subtitle: technically :-)
image: /img/hello_world.jpeg
tags: [automation, orchestration, labs, Ansible, security, SDN, Juniper, Cisco, EVE-NG, VMware, NSX, ESXi, failure, IPAM, DCIM, optical, DWDM, intent, BGP, python, opendaylight]
---

If you only read one thing then make it the last link in this post about the BA failure….


## Automation, orchestration and labs

* Vagrant setup on windows (Cumulus Spine and leaf with Ubuntu servers) – [very easy to follow with detailed instructions](https://github.com/CumulusNetworks/cldemo-vagrant-onwindows/blob/master/README.md)
* [Jon Spriggs](https://twitter.com/jontheniceguy?lang=en) - [Test Driven Development (TDD) for networks, using Ansible.](https://jon.sprig.gs/blog/post/537)
* Ansible config management [a starters guide](https://www.youtube.com/watch?v=fYd_KQpfBs8&)
* Realworld network automation 1hr [YouTube video](https://www.youtube.com/watch?v=s-eL6M0bOQw&)
* NetDevOps Ansible 101, 1hr 37min [YouTube video](https://www.youtube.com/watch?v=ArqvSGRzUBw&)
* Repository of [Juniper Vagrant boxes](https://app.vagrantup.com/juniper) and [top level box search](https://app.vagrantup.com/boxes/search)
* Ansible [webinars](https://www.ansible.com/webinars-training)
* Brief YouTube [video intro](https://youtu.be/_o_1XLt1hi8) to a Python course for Network engineers 
* France-IX’s Approach to [Network Automation](https://forums.juniper.net/t5/Customer-Stories-and-Successes/France-IX-s-Approach-to-Network-Automation/ba-p/308939)


## Security

* Learn about the basic tenets of a secure network  in a new Juniper book [Understanding Security Building Blocks](http://juni.pr/2sOF3Ol)


## SDN

* Opendaylight [commentary](http://packetpushers.net/opendaylight-carbon-what-sdn-has-become/)
* Service provider – YouTube video [intro to SDN](https://www.youtube.com/watch?v=MSzeITPFWbc&)
* Opendaylight and Cisco OFM YouTube (GNS3) [video](https://www.youtube.com/watch?v=UnwEtt5EQOY&) & [text](https://github.com/davidbombal/GNS3Talks/blob/master/ODL%20OFM%20%20install%20with%20GNS3.txt)


## Juniper

* Network convergence [node slicing](https://forums.juniper.net/t5/Automation-Programmability/Network-Convergence-with-Junos-Node-Slicing/ba-p/309213)
* Managing [commit time](https://dataplumber.wordpress.com/2015/09/17/managing-junos-commit-time/)
* BGP Resource Public Key Infrastructure (RPKI) - a framework towards [securing BGP and Internet infrastructure](http://juni.pr/2nMbPK2) 
* QFX controllerless overlay with all-active Ethernet segments [blog post](https://www.inetzero.com/qfx-controllerless-overlay-active-ethernet-segments/)
* Junos Fusion Data Center Architecture [PDF](http://juni.pr/2r3Qkqo)


## Cisco

* Cisco Digital Network Architecture – little bit damming but gives an overview of Cisco’s recent [announcement](http://www.futuriom.com/articles/news/cisco-reinvents-sdn-market-yawns/2017/06)
* Good Cisco related blog with labs, [Networking with fish](http://www.networkingwithfish.com/)


## VMware

* Deploying Nested ESXi with a [ESXi Virtual Appliance](http://www.virtuallyghetto.com/2015/12/deploying-nested-esxi-is-even-easier-now-with-the-esxi-virtual-appliance.html)
* VMware partner [NSX resources](https://www.dropbox.com/s/ok0mor83c0q4ibs/NSX%20Resources%202016.pdf?dl=0)
* NSX study guide [PDF](https://communities.vmware.com/servlet/JiveServlet/downloadBody/32973-102-1-45257/VCP-NV%20Study%20Guide.pdf)
* Routing with NSX using multiple sites (eBGP) [YouTube video](https://www.youtube.com/watch?v=JRVHjWhj2_Y)


## Intent or Intuitive networking

* Data Centre related - watch "Apstra Operating System (AOS): Vendor-Agnostic, Intent-Driven Network Automation" on [YouTube](https://youtu.be/kyNxXcX0m-0)


## IP address Mgmt and Data Centre Infrastructure Mgmt (IPAM/DCIM)

* Impressive tool that’s just past its one year open source birthday. [Netbox Open source IPAM](https://github.com/digitalocean/netbox)


## Training and knowledge

* List of Free or Low-Cost [IT Training](http://www.network-node.com/blog/2017/4/22/list-of-free-or-low-cost-it-training)


## Data Centre

* EVPN DCI options & config (Juniper) [blog post](https://packet-expert.org/2017/06/08/evpn-based-data-center-interconnect-juniper-design-option-and-config-guide/)
* Compliments of Cumulus, BGP in the Data Centre [PDF](https://cumulusnetworks.com/learn/web-scale-networking-resources/whitepapers/9781491983386.pdf) with accompanying GitHub [code](https://github.com/oreillymedia/bgp_in_the_data_center)


## Optical networking

* Everything You Always Wanted to Know About Optical Networking 1hr 27min YouTube [video](https://www.youtube.com/watch?v=_KFpXuHqHQg)
* Juniper - Packet Optical Networks and Forward Error Correction (FEC) [PDF poster](http://juni.pr/2sn0jIs) 


## Various

* To Jumbo or Not to Jumbo? [Blog post](http://blog.ipspace.net/2017/06/to-jumbo-or-not-to-jumbo.html?m=1)
* [Carrier-Grade Networking](https://www.packetfabric.com/) Only US based at the moment and have only just started operation. Details in this [podcast](http://blog.ipspace.net/2017/06/packet-fabric-on-software-gone-wild.html). They have a very high capacity and available network comprising of Juniper QFX10Ks, MXs and some vMXs + a load of optical kit and experience with a easy to use and powerful provisioning portal. It uses VXVLAN with BGP-EVPN along with some MPLS (RSVP-TE) – they seem to be offering highly available, high speed, high capacity connectivity across North America with low contract terms built using Ansible and custom software to give customers very fast turn up of connectivity and flexibility on billing. They seem to be planning rapid expansion in the US along with European presence by the end of this year along with parts of Asia
* British Airways failure. Nicely dovetails into the last posts link about inevitable failure – [BA failure analysis](https://www.theregister.co.uk/2017/06/05/british_airways_critical_path_analysis/)
