@echo off

::*******************************************************************
:: Download and Install JDK, JRE and Node.js
::*******************************************************************
:: Before running following command, the JDK and JRE should be installed.
:: Find JDK from: https://www.oracle.com/java/technologies/javase-downloads.html
:: Find JRE from: https://java.com/en/download/manual.jsp. Download the version Windows Offline (64-bit).
:: See the installation instruction from here: https://www3.ntu.edu.sg/home/ehchua/programming/howto/JDK_Howto.html
:: Also need to check if your JRE has the same or higher version than JDK version. If you have installed multiple
:: versions of JRE, add the higher version JRE path to the top of your "Path" environment

:: Download and install Node.js: https://nodejs.org/en/download/

:: set MODELICAPATH

::*******************************************************************
:: Setup Maven
::*******************************************************************
:: Download maven
echo ----------- Downloading Apache Maven ----------- 
set MVNLink=http://mirrors.ibiblio.org/apache/maven/maven-3/3.6.3/binaries/apache-maven-3.6.3-bin.zip
set MVNZip=%CD%\apache_maven.zip
bitsadmin /transfer "Downloading MVN" %MVNLink% %MVNZip%

:: Unpack Maven
set MVNFolder=apache_maven
mkdir %MVNFolder%
tar -xf apache_maven.zip -C %MVNFolder% --strip-components 1
del /f %MVNZip%

:: User changeable, make sure the JAVA_HOME is to the JDK, not JRE
set JAVA_HOME=C:\Program Files\Java\jdk-13.0.2

:: Compile jave to produce jar
echo ----------- Compiling jave to produce jar ----------- 
cd java
CALL ..\apache_maven\bin\mvn package
CALL move parser\target\parser-1.0-SNAPSHOT.jar moParser.jar
CALL ..\apache_maven\bin\mvn clean

cd..
:: Install node package
echo ----------- Installing node package -----------
CALL npm install --save

:: Now you should be able to run the modelica-json parse. But firstly, need to make sure your system has
:: memory larger than 2048m
:: see in lib\modelicaToJSON.js: line 36-37

pause
