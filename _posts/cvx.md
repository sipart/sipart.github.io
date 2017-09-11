---
layout: draft
title: Cumulus VX - EVPN, BGP unnumbered, netq
image: /img/cumulus-networks-logo.png
subtitle: Cumulux EVE-NG DC lab
tags: [Cumulus, EVE-NG]
---
## NETQ setup on an exisiting DC fabric lab (real or virtual)

![Cumulus Fabirc](/img/cumulus-DC.png)


The above lab created in [EVE-NG](http://www.eve-ng.net/) is based on the **Quickstart Dual-Attach (MLAG) Demo** from this [Cumulus github page](https://github.com/CumulusNetworks/cldemo-evpn).

	
Additional elements are the devices outside the DC fabirc - the ZTP_DHCP device is acting as the REDIS server in the NETQ setup below. The ztp-net and cumulus_ztp_test devices are not used in this post.


[NetQ](https://cumulusnetworks.com/products/netq/) is a telemetry-based fabric validation system. You can try this out for free using Cumulus VX with the important caveat that you can't try out the NETQ telemetry server as you need a Cumulus licence to download the VM. But you can setup all the other components and run NETQ valiadation commands that query the REDIS server to see the fabric state.


## Changes to all switches in the fabric to enable NETQ

	net add routing route 0.0.0.0/0 192.168.0.1
	net commit

Edit the sources file and uncomment the early access repository lines and save the file **NOTE these next steps to get early access may no longer be needed if using the latest Cumulus VX images):

	sudo nano /etc/apt/sources.list

	deb http://repo3.cumulusnetworks.com/repo CumulusLinux-3-earlyaccess cumulus
	deb-src http://repo3.cumulusnetworks.com/repo CumulusLinux-3-early-access cumulus

Run the following commands in a terminal to install the cumulus-netq package:

	sudo apt update
	sudo apt install cumulus-netq -y
	

## REDIS server / switch

Use apt-get to install the packages:

	sudo apt update
	sudo apt install redis-server redis-tools

	sudo nano /etc/redis/redis.conf

If the bind line links to localhost (127.0.0.1) then change it to the IP address of one or more external ports, such as eth0:
	
	bind 192.168.0.250

Restart the REDIS server service:

	sudo systemctl restart redis-server.service
	
Set the REDIS service to start on boot:

	sudo systemctl enable redis-server.service

Check status of REDIS service:

	systemctl status redis-server.service

Log location for troubleshooting:
	
	logfile /var/log/redis/redis-server.log


## Client switches

Specify the IP address of the REDIS server and start the agent. 
For example:

	sudo netq add server 192.168.0.250
	sudo netq agent start
	

## Verification commands

Full fabric checks from any of the devices in the fabric:

	netq show agents
	netq show bgp
	netq show interfaces
	netq show macs
	netq show services
	netq show lldp
	netq show clag

To show full list of commands:

	netq show 
	
You can query any other device from any other device:

	netq spine01 show bgp
	netq leaf03 show interfaces
	netq spine02 show stp topology
