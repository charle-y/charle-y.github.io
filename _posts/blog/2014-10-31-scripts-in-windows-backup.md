---
layout: post
title: Windows设置热点、代理命令
description: 设置热点共享、快捷设置代理的一些脚本
category: blog
---

>这是以前用到的一些命令，备份在此。

以下代码如无特别说明，均在`命令提示符(cmd.exe)`窗口中使用，有些代码需要管理员权限运行`命令提示符`。

##Windows自带的Wi-Fi命令两则

Windows Vist以后的Windows系统中的自带命令`netsh`开始支持设置Wi-Fi共享。

###设置Wi-Fi热点共享

Wi-Fi热点设置：

     netsh wlan set hostednetwork mode=allow ssid=yourssid key=yourkey

打开Wi-Fi热点：
     
     netsh wlan start hostednetwork
     
关闭Wi-Fi热点：
     
     netsh wlan stop hostednetwork
     
关闭命令是不太必需的，在系统待机、注销、挂起、关机操作时，Wi-Fi热点会自动关闭。

###查看周围无线的参数

     netsh wlan show networks mode=bssid

##IE代理设置快捷方式

为了尽快进入到IE代理的设置界面，节约打开`IE>Internet选项>连接>LAN设置`的时间，搜索网络上的解答如下。

如未特别声明，以下代码可直接保存到文本文件中，并重命名文件为`.bat`格式。

###较不快捷的快捷方式

     control Inetcpl.cpl,,4

上面的代码直接打开了`Internet选项`的`连接`选项卡，要完成设置代理操作还需要点击`LAN设置`。

###适用于Windows 8.1 快捷方式

在桌面右键，新建快捷方式，在`请键入项目的位置`的文本框中输入以下代码：

     %windir%\explorer.exe %localappdata%\Packages\windows.immersivecontrolpanel_cw5n1h2txyewy\LocalState\Indexed\Settings\en-US\AAA_Proxy_Automatic_Config_Group.settingcontent-ms

点击`下一步`，随便取个名字，点击`完成`。此快捷方式进入到Windows Modern的设置界面下的代理设置。

###较危险的快捷方式

IE代理的设置可以直接通过修改注册表实现，而且以下对注册表的操作命令没有请求权限的提示，请确保涉及注册表部分的代码完全正确。

####使用`reg add`命令

关闭代理

     reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f
     
打开代理

     reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f

设置代理地址

     reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d proxyserver:port /f

上面代码中的`proxyserver:port`是代理服务器的地址和端口号，例如将其替换成`"121.121.121.121：1212"`，**包括引号**。

####使用`.vbs`代码实现简单交互

以下代码是为内人所做。

     'read .ini function goes here
     Function ReadPeiZhi(strLuJing,JieMing)
     Const ForReading = 1
     ReadPeiZhi=0
     Set FSO = CreateObject("Scripting.FileSystemObject")
     Set TextFile = FSO.OpenTextFile(strlujing, ForReading)
     Do Until TextFile.AtEndOfStream 
     strLine =TextFile.ReadLine
     if instr(strLine,"=")<>0 Then
     StrFile=Split(StrLine,"=")
     if trim(strFile(0))=JieMing Then
     ReadPeiZhi=Trim(strFile(1))
     Exit Do
     End If
     End If
     Loop
     Set FSO=Nothing
     End Function
     'end of read .ini function

     'main code goes here
     lgjys="0.0.0.0:0"
     lgqs="0.0.0.0:0"
     set fso=CreateObject("Scripting.FileSystemObject")
     ini = "代理配置文件.ini" '配置文件名称
     if fso.FileExists(ini) Then'判断文件存在
       lgjys=ReadPeiZhi(ini,"lgjys")
       lgqs=ReadPeiZhi(ini,"lgqs")
     end if

     set ws=wscript.createobject("wscript.shell")
     path="HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\"
     isON=ws.regread(path&"ProxyEnable")
     proxyServer=ws.regread(path&"ProxyServer")
     if proxyServer=lgjys then
       serverStatus = "[老公教研室]"
       server2goid = "[老公寝室]"
       server2go = lgqs
     else
       serverStatus = "[老公寝室]"
       server2goid = "[老公教研室]"
       server2go = lgjys
     end if
     if isON=1 then
       selectH1=msgbox ("  “是”  --关闭代理"& Chr(10) &"  “否”  --切换到"&server2goid& Chr(10) &"“取消”--保持现状",35," 代理状态 ：开 ** "&serverStatus)
       if selectH1=vbyes then
         val=ws.regwrite(path&"ProxyEnable",0,"REG_DWORD")
         msgbox "代理已关闭，爱你么么哒！",64,"我爱你"
       elseif selectH1=vbno then
         val=ws.regwrite(path&"ProxyEnable",1,"REG_DWORD")
         val=ws.regwrite(path&"ProxyServer",server2go,"REG_SZ")
         msgbox "已切换到"&server2goid&"代理，爱你么么哒！",64,"我爱你"
       else
         msgbox "白折腾了！还是爱你么么哒！",48,"我爱你"
       end if
     else
       selectH0=msgbox ("  “是”  --打开并设置代理地址为[老公教研室]"& Chr(10) &"  “否”  --打开并设置代理地址为[老公寝室]"& Chr(10) &"“取消”--不打开代理",35,"确定打开代理？")
       if selectH0=vbyes then
         val=ws.regwrite(path&"ProxyEnable",1,"REG_DWORD")
         val=ws.regwrite(path&"ProxyServer",lgjys,"REG_SZ")
         msgbox "已打开[老公教研室]代理，爱你么么哒！",64,"我爱你"
       elseif selectH0=vbno then
         val=ws.regwrite(path&"ProxyEnable",1,"REG_DWORD")
         val=ws.regwrite(path&"ProxyServer",lgjys,"REG_SZ")
         msgbox "已打开[老公寝室]代理，爱你么么哒！",64,"我爱你"
       else
         msgbox "白折腾了！还是爱你么么哒！",48,"我爱你"
       end if
     end if
     
其中`代理配置文件.ini`是配置文件，包含代理服务器的地址，与上面代码保存为的`.vbs`文件放在同一目录下。
`代理配置文件.ini`形如：

     -------------配置文件开始--------------------
     lgjys="0.0.0.0:0"
     lgqs="0.0.0.0:0"
     
##[Firefox]的代理脚本
在Firefox中使用代理，可以安装扩展，而如果你有FireGestures扩展，并且不想为代理安装一个单独的扩展，可以使用[FireGestures]（[项目主页]）脚本手势完成代理状态的切换。下面代码复制到FireGestures设置里面的用户脚本中。

    var Spref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var currentN = Spref.getIntPref('network.proxy.type');
    var currentS = "";
    var positionI = "moz-icon:file:///D:\\Program Files (x86)\\Mozilla Firefox\\Profiles\\24.ico";
    var alertT = "最爱华华";
    if (currentN==1)
    {currentS = "全局代理";var currentI1 = "menuitem-iconic";}
    else if (currentN==0)
    {currentS = "直接连接";var currentI0 = "menuitem-iconic";}
    else if (currentN==2)
    {currentS = "自动代理";var currentI2 = "menuitem-iconic";}
    else if (currentN==5)
    {currentS = "系统设置";var currentI5 = "menuitem-iconic";}
    FireGestures.setStatusText("当前代理状态：  " + currentS)

    FireGestures.generatePopup(event,
        [
            { label: "全局代理",  image: positionI, class:currentI1, oncommand: "var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);pref.setIntPref('network.proxy.type', 1);" },
            { label: "直接连接",  image: positionI, class:currentI0, oncommand: "var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);pref.setIntPref('network.proxy.type', 0);" },
            { label: "自动代理",  image: positionI, class:currentI2, oncommand: "var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);pref.setIntPref('network.proxy.type', 2);" },
            { label: "系统设置",  image: positionI, class:currentI5, oncommand: "var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);pref.setIntPref('network.proxy.type', 5);" },
        ]
    );
    
[Firefox]:https://www.mozilla.org/en-US/firefox/new/
[FireGestures]:https://addons.mozilla.org/zh-CN/firefox/addon/firegestures/?src=search
[项目主页]:http://www.xuldev.org/firegestures/