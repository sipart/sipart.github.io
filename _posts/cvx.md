---
layout: draft
title: Cumulus VX - EVPN, BGP unnumbered, netq
image: /img/cumulus-networks-logo.png
subtitle: Cumulux EVE-NG DC lab
tags: [Cumulus, EVE-NG]
---
![Cumulus Fabirc](/img/cumulus-DC.png)

Moving from Quagga to FRRouting:

	https://docs.cumulusnetworks.com/display/DOCS/Upgrading+from+Quagga+to+FRRouting

Quickstart: Dual-Attach (MLAG) Demo:

	https://github.com/CumulusNetworks/cldemo-evpn

## NETQ setup


## Changes to all switches in the fabric to enable NETQ

	net add routing route 0.0.0.0/0 192.168.0.1
	net commit

	

Edit the sources file and uncomment the early access repository lines and save the file:

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

logfile /var/log/redis/redis-server.log


## Client switches

Specify the IP address of the REDIS server and start the agent. 
For example:

	sudo netq add server 192.168.0.250
	sudo netq agent start
	

## Verification commands

Basic check from any of the devices in the fabric:

	netq show agents

To show full list of commands:

	netq show 

Or specific queries:

	netq show bgp
	netq show interfaces
	netq show macs
	netq show services
	netq <nodename> show stp topology
	netq show lldp
	
You can query any other device from any other device:

	netq spine01 show bgp
	netq leaf03 show interfaces
	netq show clag
