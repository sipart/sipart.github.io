* Download raw data from [ripe data site](http://data.ris.ripe.net/rrc24/)
* bgpdump is needed to convert the raw data into a format bgpview can read (bpg_simple perl script uses bgpview)

''zcat latest-bview.gz | bgpdump -m - > jan2021routes''
