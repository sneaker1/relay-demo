#!/bin/bash

n=$1
for (( i=0 ; i<$n; i++ ))
do
    node 2-peer.js random > ./logs/peer$i.txt &
    #node 2-peer.js random > /dev/null &
    PID[$i]=$!
done

sleep 60

for (( i=0 ; i<$n; i++ ))
do
    kill ${PID[i]}
done

