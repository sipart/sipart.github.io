---
layout: page
title: Juniper Python
subtitle: Notes and Links
image: /img/python.png
---

* Download [SLAX scripts from here](https://github.com/Juniper/junoscriptorium) or for more usefully [Python scripts here](https://github.com/Juniper/junosautomation/tree/master/on-box-python)

* Understanding Python Automation Scripts for Devices [Running Junos OS](https://www.juniper.net/documentation/en_US/junos/topics/concept/junos-script-automation-python-scripts-overview.html)

* Junos Python [Modules](https://www.juniper.net/documentation/en_US/junos/topics/reference/general/junos-python-modules-on-device.html)

* PyEz [Modules](https://junos-pyez.readthedocs.io/en/latest/jnpr.junos.html)

* PyEz [CookBook](https://www.juniper.net/documentation/en_US/day-one-books/DO_PyEZ_Cookbook.pdf) and GitHub repo with [examples](https://github.com/Juniper/junosautomation/tree/master/pyez/PyEZ_Cookbook_2017)

* Example: Changing the Configuration Using [Python Op Scripts](https://www.juniper.net/documentation/en_US/junos/topics/example/junos-script-automation-op-script-changing-configuration-python.html)

You enable op scripts by listing the filenames of one or more op script files within the ```[edit system scripts op]``` hierarchy level

example for op script called ```test.py```:

    set system scripts op file test.py

To execute local op scripts, you must add the script file names to the appropriate op script directory on the device:

    /var/db/scripts/op

Similar process for commit, event and snmp

    /var/db/scripts/commit

    /var/db/scripts/event

    /var/db/scripts/snmp

## Scripts can also be written in Python - types of scripts stored in the same folders as above

Python 2.7 for Junos 16.1+ to 20.1 (no 2.7 in 20.2R1)

Python 3.x for Junos 19.4R1+

Extra config in addition to adding script names to config:

    set system scripts language python

## Example OP script (disables the port specified and commits config)

    lab@R1> show configuration system scripts
    op {
        file port_disable.py;
    }
    language python;


lab@R1> file show /var/db/scripts/op/port_disable.py

    from jnpr.junos import Device
    from jnpr.junos.utils.config import Config
    from jnpr.junos.exception import *
    import jcs
    import sys

    def main():

        usage = """
            This script disables the specified interface.
            The script modifies the candidate configuration to disable
            the interface and commits the configuration to activate it.
        """
        print (usage)

        interface = jcs.get_input("Enter interface to disable: ")
        if not interface:
        print ("invalid interface")
        sys.exit(1)

        config_xml = """
            <configuration>
                <interfaces>
                    <interface>
                        <name>{0}</name>
                        <disable/>
                    </interface>
                </interfaces>
            </configuration>
        """.format(interface).strip()

        dev = Device()
        dev.open()
        try:
            with Config(dev, mode="exclusive") as cu:
                print ("Loading and committing configuration changes")
                cu.load(config_xml, format="xml", merge=True)
                cu.commit()

        except Exception as err:
            print (err)
            dev.close()
            return

        dev.close()

    if __name__ == "__main__":
        main()

Running the example:

    lab@R1> op port_disable.py

    This script disables the specified interface.
    The script modifies the candidate configuration to disable
    the interface and commits the configuration to activate it.

    Enter interface to disable: xe-0/0/9
    Loading and committing configuration changes

Result:

    lab@R1> show configuration interfaces xe-0/0/9
    disable;
    mtu 9192;
    unit 0 {
        family inet {
            address 10.1.1.1/30;
        }
    }


## Python Inventory OP script example (gets certain inventory info)

    from jnpr.junos import Device
    
    if __name__ == "__main__":
        with Device() as dev:
            inv = dev.rpc.get_chassis_inventory()
            model = inv.findtext("chassis/description")
            sn = inv.findtext("chassis/serial-number")
            print "Model: " + model
            print "Serial number: " + sn
            for module in inv.findall("chassis/chassis-module/name"):
                print "Chassis module: " + module.text


## Python COMMIT script example (checks for login user with invalid perms but still allows commit with warning)

    from junos import Junos_Configuration as root
    import jcs
    
    if __name__ == "__main__":
        message = "Permission all is assigned to invalid class."
        for element in root.findall("system/login/class[permissions='all']"):
            jcs.emit_warning("class:" + element.findtext('name') + " " + message)

to set the above to error and not commit

    jcs.emit_error().

## Project to Complete: Create Python script to ping all CEs

To check for CE IPs

* Check for all interfaces with IP address configured and enabled
* Then check ARP for CE IP
    * Report any with no ARP into output file
* Ping 5 times
* Print results to output file
```
   lab@R1> show arp interface xe-1/2/0.0
    MAC Address       Address         Name                      Interface               Flags
    e4:c7:22:7f:b6:85 149.6.3.193     149.6.3.193               xe-1/2/0.0              none
```
```
    lab@R1> show arp interface xe-1/2/0.0 | display xml rpc
    <rpc-reply xmlns:junos="http://xml.juniper.net/junos/16.1R3/junos">
        <rpc>
            <get-arp-table-information>
                    <interface>xe-1/2/0.0</interface>
            </get-arp-table-information>
        </rpc>
        <cli>
            <banner></banner>
        </cli>
    </rpc-reply>
```

```
    lab@R1> show arp interface xe-1/2/0.0 | display xml
    <rpc-reply xmlns:junos="http://xml.juniper.net/junos/16.1R3/junos">
        <arp-table-information xmlns="http://xml.juniper.net/junos/16.1R3/junos-arp" junos:style="normal">
            <arp-table-entry>
                <mac-address>e4:c7:22:7f:b6:85</mac-address>
                <ip-address>149.6.3.193</ip-address>
                <hostname>149.6.3.193</hostname>
                <interface-name>xe-1/2/0.0</interface-name>
                <arp-table-entry-flags>
                    <none/>
                </arp-table-entry-flags>
            </arp-table-entry>
        </arp-table-information>
        <cli>
            <banner></banner>
        </cli>
    </rpc-reply>
```
