---
layout: post
title: The Internet...
image: /img/Internet.jpg
subtitle: ...in your lab
tags: [bgp,routing table,internet,bgp_simple]
---

## Using a bgp_simple Perl Script to Inject a IPv4 Internet Routing Table Inside an EVE-NG (or real/ESXi) Network Lab 

* Multiple credits for this:
  * First to the creator [Andrey Korolyov - xdel](https://github.com/xdel) of an old but still very usable perl script called [bgp_simple.pl](https://github.com/xdel/bgpsimple) which injects a copy of a IPv4 Internet routing table into a lab.
  * And then this post by [sigey](https://iprouteblog.wordpress.com/2017/04/15/inject-full-internet-route-table-into-your-eve-lab-environment/). He compiled and configured BGP simple as per documentation, and created a downloadable .ova file of the 'BGP' Linux node (based on Ubuntu 14.1). Link in his post, but Google drive link also [here.](https://drive.google.com/file/d/0BzLrgmKsB3NSbFV5SXctWWd5alU/view) The .ova can be imported directly into VMware WS or ESXi - for EVE-NG the .ova needs to be converted. [Sigeys post](https://iprouteblog.wordpress.com/2017/04/15/inject-full-internet-route-table-into-your-eve-lab-environment/) has details on this conversion process. His image has an older copy of the Internet routing table so is approx. 570,000 prefixes in size. See the bottom of this post for some instructions on getting a newer larger copy.

* Other options to do similar exist. Here are the other options and blog posts for reference:
  * Kevin Myers post on [stubarea51.net](https://stubarea51.net/2016/01/21/put-500000-bgp-routes-in-your-lab-network-download-this-vm-and-become-your-own-upstream-bgp-isp-for-testing/) - again using bgp_simple
  * Lukasz Bromirski post on [bgp in the lab](https://lukasz.bromirski.net/post/bgp-w-labie-3/) - this takes a different approach as you will need Internet access in your lab to peer with his IPv4 and IPv6 hosts
  * Leonir Hoxha post on creating [dummy statics using python](https://ccie49534.com/2014/11/15/generating-dummy-static-ip-prefixes-with-python/) - not the Internet routing table but you can create a lot of prefixes to create a similar load

Here is my sample topology. eBGP between the Linux nodes and the transit vSRX nodes and then eBGP between the vSRX nodes and the PE routers. You can inject direct from the Linux nodes running the script into the core PEs but then you have to wait while the script runs so doesn't simulate a typical ISP peering. The script typically takes 10-15 mins to generate and advertise the table. Using the vSRX in the middle creates a level of realism and greater control of failure scenarios.

```
+---------------------+
|                     |
|                     |   +---------+
|                     |   |         |
|  +---------------+  |   |         |   +------------------------------------------+
|  |  Linux-BGP-01 +--+---+ vSRX-01 |   |                                          |
|  +---------------+  |   |         |   |   +-----------+          +-----------+   |
|                     |   +----+----+   |   |           |          |           |   |
|                     |        |        |   |           |          |           |   |
|                     |        +--------+---+   vMX-01  +----------+   vMX-03  |   |
|                     |                 |   |           |          |           |   |
|                     |                 |   |           |          |           |   |
|                     |                 |   +-----+-----+          +-----+-----+   |
|                     |                 |         |                      |         |
|                     |                 |         |                      |         |
|                     |                 |         |                      |         |
|    Internet AS      |                 |         |        CORE AS       |         |
|                     |                 |         |                      |         |
|      Linux VMs      |                 |         |                      |         |
|       running       |                 |   +-----+-----+          +-----+-----+   |
|     bgp_simple      |                 |   |           |          |           |   |
|                     |                 |   |           |          |           |   |
|                     |        +--------+---+   vMX-02  +----------+   vMX-04  |   |
|                     |        |        |   |           |          |           |   |
|                     |   +----+----+   |   |           |          |       RR  |   |
|  +---------------+  |   |         |   |   +-----------+          +-----------+   |
|  | Linux-BGP-02  +--+-- + vSRX-02 |   |                                          |
|  +---------------+  |   |         |   +------------------------------------------+
|                     |   |         |
|                     |   +---------+
|                     |
|                     |
+---------------------+
```

This setup has been used successfully in a couple of ways. In EVE-NG using the Linux hosts with vSRXs in packet mode and vMXs (old single integrated Junos 14.1 images). And in VMware ESXi using Linux VM .ova and latest vSRX 3.0 images in packet mode peering with real MX480s. For EVE-NG and ESXi I used 1 vCPU and 1GB RAM for the Linux BGP hosts, 1 vCPU and 4GB RAM for vSRXs and 2 vCPU and 4GB RAM for vMXs. The MX480s have 64GB RAM.

## Linux BGP Node Setup

Once the Linux BGP node or nodes are up in your lab then some simple steps to get up and running. 
The username and password for the sigey created image is root/bgp:

* Edit ``/etc/network/interfaces`` via console and configure eth0 (and eth1 if used for mgmt) for peering and SSH access
* Edit ``/etc/ssh/sshd_config`` to allow root ssh
* Once you have restated networking and ssh (or rebooted) then you are ready to start. I'm assuming you have created a peering on the relevant routers
  * Setting the hold time to 1800 (keep alive 600 as hold time is always 3x of keep alive) to stop peering going down unexpectedly is advised
  * Here are a couple of sample outputs. I would advise running the command while ssh connected to the Linux host and running the command in a [screen](https://linuxize.com/post/how-to-use-linux-screen/) or [tmux](https://linuxize.com/post/getting-started-with-tmux/) session. This way when you close the ssh session your script will stay running. Or use ``nohup`` command

``bgp_simple.pl -myas 65534 -myip 10.0.0.1 -peerip 10.0.0.0 -peeras 100 -holdtime 1800 -keepalive 600 -p /home/user/bgp-view/bgp-routes -n &``

The -m <1-600000> switch limits amounts of routes. Without it the whole table will be advertised (as above). 
Here is the same command with a 1000 prefix limit:

``bgp_simple.pl -myas 65534 -myip 10.0.0.1 -peerip 10.0.0.0 -peeras 100 -holdtime 1800 -keepalive 600 -p /home/user/bgp-view/bgp-routes -n -m 1000 &``

More detail on ways to leave script running in background. Script takes about 15 mins to inject whole table. Hold time of 1800 between vSRX and bgp Linux server is advised.

* ssh into the remote machine
* Start tmux by typing tmux into the shell
* Start the process you want inside the started tmux session
``bgp_simple.pl -myas 100 -myip 10.10.10.2 -peerip 10.10.10.3 -peeras 65533 -holdtime 1800 -keepalive 600 -p /home/user/bgp-view/bgp-routes -n &``
* Leave/detach the tmux session by typing Ctrl+b and then d

Use the ``nohup`` command (which allows the script to continue running even if ssh session is closed) with ``&`` at end (to create a seperate process):
``nohup bgp_simple.pl -myas 100 -myip 10.10.10.2 -peerip 10.10.10.3 -peeras 65533 -holdtime 1800 -keepalive 600 -p /home/user/bgp-view/bgp-routes -n &``
You can then close the ssh session and to check status of script when logging back in:
``tail -f nohup.out``

## Getting a Fresh BGP Internet Routing Table for bgp_simple.pl

* Download the full binary data from a RIPE member Remote Route Collector dump. For example [rrc24 data site](http://data.ris.ripe.net/rrc24/). Further details on all the Remote Route Collectors available [here](https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/ris-raw-data).
* bgpdump is needed to convert the binary data into a format the script can use. The bpg_simple perl script uses the data to inject the routes across the peering (the -m switch ensures the condensed format is used).

``zcat latest-bview.gz | bgpdump -m - > jan2021routes``

* Once converted the file can be viewed in full or snippets like so:

``head -5 jan2021routes``
```
TABLE_DUMP2|1612022400|B|103.200.115.1|64271|0.0.0.0/0|64271 60068 174|IGP|103.200.115.1|0|0||NAG||
TABLE_DUMP2|1612022400|B|168.195.131.1|263702|0.0.0.0/0|263702 52468|IGP|168.195.131.1|0|0||NAG||
TABLE_DUMP2|1612022400|B|200.40.162.202|6057|0.0.0.0/0|6057 12956|IGP|200.40.162.202|0|0||NAG||
TABLE_DUMP2|1612022400|B|200.7.84.35|28000|0.0.0.0/0|28000|IGP|200.7.84.35|0|0||NAG||
TABLE_DUMP2|1612022400|B|45.65.244.1|265721|0.0.0.0/0|265721 23520|IGP|45.65.244.1|0|0||NAG||
```
or

``cat jan2021routes | grep 62.60.0.0/17``
```
TABLE_DUMP2|1612022400|B|103.200.115.1|64271|62.60.0.0/17|64271 60068 2914 3356 6779 49572|IGP|103.200.115.1|0|0||NAG||
TABLE_DUMP2|1612022400|B|154.11.15.28|852|62.60.0.0/17|852 3356 6779 49572|IGP|154.11.15.28|0|0||NAG||
TABLE_DUMP2|1612022400|B|168.195.131.1|263702|62.60.0.0/17|263702 12956 174 6779 49572|IGP|168.195.131.1|0|0||NAG||
TABLE_DUMP2|1612022400|B|177.221.140.1|270014|62.60.0.0/17|270014 36236 3356 6779 49572|IGP|177.221.140.1|0|0|3356:2 3356:22 3356:84 3356:123 3356:500 3356:2073 36236:50 36236:1001|NAG||
TABLE_DUMP2|1612022400|B|45.183.45.1|64116|62.60.0.0/17|64116 7195 3356 6779 49572|IGP|45.183.45.1|0|0|3356:2 3356:22 3356:84 3356:123 3356:500 3356:2073 7195:111 7195:51000 7195:51001 7195:51200 7195:51202|NAG||
TABLE_DUMP2|1612022400|B|45.65.244.1|265721|62.60.0.0/17|265721 23520 6939 6779 49572|IGP|45.65.244.1|0|0||NAG||
TABLE_DUMP2|1612022400|B|5.188.4.211|46997|62.60.0.0/17|46997 6939 6779 49572|IGP|5.188.4.211|0|0||NAG||
```
* Upload your new table (``jan2021routes`` in my case) to the Linux BGP nodes into ``/home/user/bgp-view/`` and adjust the bgp_simple.pl command statement you run to use ``jan2021routes`` instead of the ``bgp-routes`` file
