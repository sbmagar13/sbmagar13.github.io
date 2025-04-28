---
id: 4
title: "Configure Postfix on Ubuntu"
excerpt: "Mail service self hosted."
date: "2024-12-17"
readTime: "4 min"
tags: ["mail", "linux", "self-hosted"]
featured: false
---

# Configure Postfix on Ubuntu (24.04 | 22.04 | 20.04)

What’s up, guys!!

Today, I’ll talk about how to install and configure Postfix on Ubuntu, so that you can use it to send mail using [Gmail](https://gmail.com/). If you’re using a Linux system, you probably heard of Postfix. Postfix is one of the most popular **Mail Transfer Agent** (MTA) that is used to route and deliver email on a Linux system. Also, it’s open-source and widely used by approx. 33% of internet mail servers.
cp
## Prerequisites

Before installing and configuring postfix, you need to have some pre-requirements:

- A Linux server (**Ubuntu 22.04** in my case)
- A Google account with two-factor authentication

## Google Account Set Up

First, before proceeding to set up Postfix, you need to set up your google account.

- Open a web browser and log into your [google account](https://myaccount.google.com/).
- Navigate to ***Security*** from the sidebar menu and scroll down and click on ***App passwords.***
- You have to enable two-factor authentication if you haven’t already.

![Selection_357.png](Configure%20Postfix%20on%20Ubuntu%20(24%2004%2022%2004%2020%2004)%2029208bba09f644d7abda262465e424a4/Selection_357.png)

- Now **generate** a new password. *(Log in with Gmail password if prompted.)*

![Selection_359.png](Configure%20Postfix%20on%20Ubuntu%20(24%2004%2022%2004%2020%2004)%2029208bba09f644d7abda262465e424a4/Selection_359.png)

- Save the password for your newly created app.

![Selection_362.png](Configure%20Postfix%20on%20Ubuntu%20(24%2004%2022%2004%2020%2004)%2029208bba09f644d7abda262465e424a4/Selection_362.png)

## Postfix - Installation

### Step-1: Postfix and Mailutils installation

Let’s install ***postfix*** and ***mailutils***(or mailx for Fedora):

```bash
$ sudo apt update
$ sudo apt install postfix mailutils -y
```

### Step-2: Gmail Set Up for Postfix

Once you have successfully installed Postfix, now it’s time to set up Gmail authentication. For security purposes, you need to put the app password created before in the configuration file and lock it down. This is done so that no one can see your app password. 

To do so:

```bash
$ sudo nano /etc/postfix/sasl_passwd
```

And add this line:

```bash
[smtp.gmail.com]:587   sagar.exclamation@cloudyfox.com:uhpyqdiozquddfmc
```

Save and exit the file. Now, make the file accessible only by root to be safer.

```bash
$ sudo chmod 600 /etc/postfix/sasl_passwd
```

## Postfix - Configurations

### Step-1: Configure SMTP to Postfix

Till now, you have set up Gmail authentication and installed Postfix and mailutils so far. Now, you have configuration file `/etc/postfix/main.cf` for postfix, in which you’ll be writing some extra stuff to make postfix work with Gmail.

- Open [`main.cf`](http://main.cf) file using editor of your choice (vim or nano):

```bash
$ sudo nano /etc/postfix/main.cf
```

- See the following lines, if not add them:

```bash
# Add gmail SMTP server
relayhost = [smtp.gmail.com]:587
# Enable SASL authentication
smtp_sasl_auth_enable = yes
# Disallow methods that allow anonymous authentication
smtp_sasl_security_options = noanonymous
# Location of sasl_passwd
smtp_sasl_password_maps = hash:/etc/postfix/sasl/sasl_passwd
# Enable STARTTLS encryption
smtp_tls_security_level = encrypt
# Location of CA certificates
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
```

- Save and exit the file.

### Step-2: Set Up App Password File to Postfix

Feed password file created earlier into Postfix using `postmap`. Postmap is included in mailutils or mailx utilities.

 

```bash
$ sudo postmap /etc/postfix/sasl_passwd
```

### Step-3: Restart the Postfix and Test

Now after all configurations are set up, restart the postfix:

```bash
$ sudo systemctl restart postfix.service
```

Test the mail server:

```bash
$ echo "Just a test mail" | mail -s "Test Mail" sagar.exclamation@gmail.com
```

Here, `mail` is another utility tool installed with mailutils or mailx. You’ll get a test mail in mentioned gmail account.

OR, 

You can test postfix email sending with Gmail using Postfix’s `sendmail` implementations:

```bash
sendmail recipient@elsewhere.com
From: you@example.com
Subject: Test mail
This is a test email
.
```

Here, `.` is used to end the process, as there will be no prompt between lines.

You can check the logs by opening syslog:

```bash
$ sudo tail -f /var/log/syslog
```

## Summary

- Postfix is a popular open-source Mail Transfer Agent (MTA) used by ~33% of internet mail servers
- Setup requires Ubuntu server and Google account with 2FA enabled
- Process involves generating Gmail app password, installing Postfix and mailutils, and configuring SMTP settings
- Key configuration files: /etc/postfix/sasl_passwd for Gmail credentials and /etc/postfix/main.cf for SMTP settings
- Mail can be tested using either the mail command or Postfix's sendmail implementation
- System logs can be monitored through /var/log/syslog
