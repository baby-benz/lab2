#!/bin/sh
DIR="$( cd "$( dirname "$0" )" && pwd )"

cd ${DIR}
pwd

swiftgen xcassets Blizz.xcassets Buttons.xcassets Full.xcassets Host.xcassets Images.xcassets PartnerList.xcassets QuickJoin.xcassets QuickSupport.xcassets Shared.xcassets -t swift4 > TVUserInterfaceAssets.swift
