## Getting a Fresh BGP Internet Routing Table for [bgp_simple.pl](https://github.com/xdel/bgpsimple): A Simple BGP Peering and Route Injection Script.

* Download the full binary data from a RIPE member Remote Route Collector dump. For example [rrc24 data site](http://data.ris.ripe.net/rrc24/). Further details on all the Remote Route Collectors available [here](https://www.ripe.net/analyse/internet-measurements/routing-information-service-ris/ris-raw-data).
* bgpdump is needed to convert the binary data into a format the script can use. The bpg_simple perl script uses the data to inject the routes across the peering (the -m switch ensures the codensed format is used).

``zcat latest-bview.gz | bgpdump -m - > jan2021routes``

* Once converted the file can be viewed in full or snippets like so:

``head -5 jan2021routes``
    
    TABLE_DUMP2|1612022400|B|103.200.115.1|64271|0.0.0.0/0|64271 60068 174|IGP|103.200.115.1|0|0||NAG||
    TABLE_DUMP2|1612022400|B|168.195.131.1|263702|0.0.0.0/0|263702 52468|IGP|168.195.131.1|0|0||NAG||
    TABLE_DUMP2|1612022400|B|200.40.162.202|6057|0.0.0.0/0|6057 12956|IGP|200.40.162.202|0|0||NAG||
    TABLE_DUMP2|1612022400|B|200.7.84.35|28000|0.0.0.0/0|28000|IGP|200.7.84.35|0|0||NAG||
    TABLE_DUMP2|1612022400|B|45.65.244.1|265721|0.0.0.0/0|265721 23520|IGP|45.65.244.1|0|0||NAG||`

or 

``cat jan2021routes | grep 62.60.0.0/17``

    TABLE_DUMP2|1612022400|B|103.200.115.1|64271|62.60.0.0/17|64271 60068 2914 3356 6779 49572|IGP|103.200.115.1|0|0||NAG||
    TABLE_DUMP2|1612022400|B|154.11.15.28|852|62.60.0.0/17|852 3356 6779 49572|IGP|154.11.15.28|0|0||NAG||
    TABLE_DUMP2|1612022400|B|168.195.131.1|263702|62.60.0.0/17|263702 12956 174 6779 49572|IGP|168.195.131.1|0|0||NAG||
    TABLE_DUMP2|1612022400|B|177.221.140.1|270014|62.60.0.0/17|270014 36236 3356 6779 49572|IGP|177.221.140.1|0|0|3356:2 3356:22 3356:84 3356:123 3356:500 3356:2073 36236:50 36236:1001|NAG||
    TABLE_DUMP2|1612022400|B|45.183.45.1|64116|62.60.0.0/17|64116 7195 3356 6779 49572|IGP|45.183.45.1|0|0|3356:2 3356:22 3356:84 3356:123 3356:500 3356:2073 7195:111 7195:51000 7195:51001 7195:51200 7195:51202|NAG||
    TABLE_DUMP2|1612022400|B|45.65.244.1|265721|62.60.0.0/17|265721 23520 6939 6779 49572|IGP|45.65.244.1|0|0||NAG||
    TABLE_DUMP2|1612022400|B|5.188.4.211|46997|62.60.0.0/17|46997 6939 6779 49572|IGP|5.188.4.211|0|0||NAG||
