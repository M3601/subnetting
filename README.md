# Subnett

#### A tool for subnetting

> Warning: not implemented for IPv6

This is a useful tool for doing your networking homework, based on my experience in my networking course.

It is based on a few mathematical formulas, explained by follow.

Given an address $A$, with first $n$ network bits:

The netmask $M$ is:

$M$ = 0**×**FFFFFFFF << (0**×**20 - $n$)

The network address $N$ is:

$N$ = $A$ & $M$

The broadcast address $B$ is:

$B$ = $N$ | (~$M$)


