# Introduction #
This is a basic guide to setup a development environment for this project.

# Downloads #
  * IntelliJ IDEA https://www.jetbrains.com/idea/download/ download ultimate version as trial
  * MySQL installer http://dev.mysql.com/downloads/file.php?id=455548 download at least mysql workbench from the installer
  * JDK 8 http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

  * Web Storm: https://www.jetbrains.com/webstorm/

  * Git: http://git-scm.com/downloads

# IntelliJ IDEA Configuration #
  * First Create a sample project
  * We will select spring mvc java sdk 8
  * **IMPORTANT** click  again **4** even if it seems clicked
![http://i.imgur.com/NjVPrA1.jpg](http://i.imgur.com/NjVPrA1.jpg)

Now we will configure Amazon Web Services connection Go to Settings

![http://i.imgur.com/2cGCVWH.jpg](http://i.imgur.com/2cGCVWH.jpg)

We will add amazon web services plugin Go to plugin type amazon and browse

![http://i.imgur.com/dPmlEzW.jpg](http://i.imgur.com/dPmlEzW.jpg)

Download shown plugin and restart IntelliJ

![http://i.imgur.com/V9LZFup.jpg](http://i.imgur.com/V9LZFup.jpg)

Reopen your project and go to edit configurations

![http://i.imgur.com/jkrclyv.jpg](http://i.imgur.com/jkrclyv.jpg)

Click plus icon and show irrelevant option also

![http://i.imgur.com/EnhDIBg.jpg](http://i.imgur.com/EnhDIBg.jpg)

Select AWS ElasticBeanstalk Deployment

![http://i.imgur.com/IxtFX7S.jpg](http://i.imgur.com/IxtFX7S.jpg)

Configure as show in the picture name and keys are;

  * Name = aayl6jjy9o59io.cdwie04rwthw.us-west-2.rds.amazonaws.com
  * AWSAccessKeyId=AKIAI2LN7VX5HDIPGN5Q
  * AWSSecretKey=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

![http://i.imgur.com/SpQIYku.jpg](http://i.imgur.com/SpQIYku.jpg)

  * Select the deployment it will automatically come since you opened a web project
  * Be sure to check availability of the environment name this will be your site name in our example harun-war.elasticbeanstalk.com
  * And select an application server to run in to

![http://i.imgur.com/TIQa98E.jpg](http://i.imgur.com/TIQa98E.jpg)

Then just click run after a few minutes your first site will be deployed

![http://i.imgur.com/ejz6yTA.jpg](http://i.imgur.com/ejz6yTA.jpg)

If you want to connect to the database below is the configuration

![http://i.imgur.com/5r51GMd.jpg](http://i.imgur.com/5r51GMd.jpg)