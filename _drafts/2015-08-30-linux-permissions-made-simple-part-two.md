---
title: حق دسترسی فایل‌ها در لینوکس به زبان ساده (۲) 
tags: لینوکس فایل حق دسترسی umask id inode permission
category: لینوکس
uuid: d03f3f59-8454-4644-801a-0f1f765da7be
---
هفت ماه پیش راهنمایی در مورد حق دسترسی‌ها در لینوکس نوشته بودم. این بار قصد دارم نگاه دقیق‌تری به همان موضوع داشته باشم و بکارگیری معادل عددی دسترسی‌ها را بجای حروف اختصار شرح بدهم.

در مقاله گذشته در مورد حق مالکیت و گروه‌های کاربری و حق دسترسی صحبت کردیم. اینبار قصد داریم همان موضوع را کمی بازتر کنیم و یاد بگیریم چطور معادل‌های عددی برای دسترسی‌ها را بفهمیم و بکار ببریم. 

## تاریخچه حق دسترسی
سیستم‌ عامل یونیکس و سیستم‌عامل‌های مشابه همچون لینوکس و آنهایی که استاندارد پوزیکس را پیاده می‌کنند از ابتدا نه تنها امکان چند وظیفه‌گی[^1] را پیاده کردند بلکه از همان ابتدا چند کاربره بودند. چرا که کامپیوترهای اولیه گران‌قیمت و بزرگ بودند و غالبا آنها را می‌شد در دانشگاه‌ها یا موسسات بزرگ پیدا کرد. کاربران می‌بایست از ترمینال‌های مختلف به این کامپیوترها متصل می‌شدند و منابع آن را با هم شریک می‌شدند. بنابراین چند کاربرگی یک نیاز اولیه بود که در طراحی این سیستم‌ها در نظر گرفته شد (نه چیزی که بعدا به فکرشان برسد و بخواهند به سیستم اضافه کنند). این سیستم‌ها طوری طراحی شدند که بتوان هر کاربر را از فعالیت و تغییرات دیگر کاربران مصون نگه داشت. به همین خاطر حق مالکیت و حق دسترسی ایجاد شد و هر کاربر دارای یک پوشه‌ی خانه شد که فقط حق تغییر محتوای آنرا داشت. برای دسترسی به سایر اجزاء سیستم از قبیل دستگاه‌های جانبی و فایل‌های سیستم‌عامل و مانند اینها این مدیر سیستم بود که باید وارد عمل می‌شد و اجازه اینکار را صادر می‌کرد. به این ترتیب امکان استفاده مشترک از منابع کامپیوترهای اولیه امکانپذیر شد.

## مالک و گروه و دیگران
در مدل امنیتی لینوکس کاربران می‌توانند مالک فایل‌ها باشند و مالک تعیین می‌کند چه کسی به فایل دسترسی داشته باشد. این شامل تعیین حق دسترسی برای خود مالک و گروهی که فایل به آن تعلق دارد و نیز سایر کاربران می‌شوند. اینها را به تفضیل در بخش قبلی شرح دادیم. حال اگر دستور `id` را در ترمینال وارد کنیم اطلاعات کاربر جاری را می‌بینم:

~~~bash
mehdi@debian:~/workspace/mehdix.ir/_drafts$ id
uid=1000(mehdi) gid=1000(mehdi) groups=1000(mehdi),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),108(netdev),110(lpadmin),113(scanner),118(bluetooth),999(bumblebee),1001(docker)
~~~

اما یک کاربر تازه ساخته شده عضو گروه‌های محدودتری است که به نوع سیستم عامل بستگی دارد. مثلا در دبیان یک کاربر جدید مشخصات زیر را دارد:

~~~bash
me@debian:/home/mehdi/workspace/mehdix.ir/_drafts$ id
uid=1001(me) gid=1002(me) groups=1002(me)
~~~

همانطور که می‌بینیم هر کاربر یک `uid` دارد که شماره ایست که به او اختصاص داده شده است و سیستم عامل با آن شماره کاربر را می‌شناسد. دقت کنید که کاربر *mehdi* کد ۱۰۰۰ و کاربر *me* کد ۱۰۰۱ را دارد. چون دبیان به اولین کاربر کد ۱۰۰۰ را اختصاص می‌دهد و برای بعدی ۱۰۰۱ و همینطور الی آخر. این عدد در اوبونتو از ۵۰۰ شروع می‌شود. علاوه بر این هر کاربر یک `gid` دارد که گروه اصلی او محسوب می‌شود. هر کاربر می‌تواند در گروه‌های دیگری نیز عضویت داشته باشد که لیست آنها در مقابل `groups` آمده است.

برای دانستن منشاء این اطلاعات باید به فایل‌های دیگری رجوع کنیم. فایل `/etc/passwd` مشخصات حساب‌های کاربری را در خود دارد و فایل `/etc/groups` گروه‌های موجود در سیستم را و فایل `/etc/shadow` اطلاعات مربوط به رمزعبور کاربران را. هنگام ساخت یک کاربر جدید این فایل‌ها تغییر می‌کنند. فایل `/etc/passwd` حاوی اطلاعات اسم عبور و `uid` و `gid` و اسم واقعی کاربر و پوشه خانه و همچنین شِل کاربر است. در این فایل کاربران پیش‌فرضی هم که در سیستم تعریف شده‌اند وجود دارند از جمله کاربر صفر که کاربر روت است.

## بیت‌های حق دسترسی
در سیستم‌فایل‌های شبیه به یونیکس (مثل لینوکس) ساختمان داده‌ای وجود دارد بنام [آی‌نود](https://fa.wikipedia.org/wiki/%D8%A2%DB%8C%E2%80%8C%D9%86%D9%88%D8%AF)
[^2].
 این ساختمان داده برای نگهداری اطلاعات در مورد اشیاء سیستمی بکار می‌رود که می‌توانند چیزهای مختلفی باشند از جمله فایل‌ و دایرکتوری‌. در این ساختمان داده بخشی وجود دارد برای نگهداری «مود» هر شیء. محتوای این بخش مشخص می‌کند که کدام کاربران می‌توانند به داده‌های مورد اشاره در این *inode* دسترسی داشته باشند. ما به طور مستقیم با این ساختمان داده کاری نداریم اما وقتی دستور `ls -l` را وارد می‌کنیم، ده کاراکتری که در ابتدای خروجی مشاهده می‌کنیم در حقیقت از ساختمان داده بالا آمده‌اند:

~~~bash
me@debian:/home/mehdi/workspace/mehdix.ir/_drafts$ ls -l
-rw-r--r-- 1 mehdi mehdi   200 Jun 10 22:13 jekyll-rtl.md
~~~

به ده کاراکتر اول خروجی «مشخصات فایل»[^3] گفته می‌شود. کاراکتر اول نوع فایل را مشخص می‌کند که در جدول زیر آمده است:


|کاراکتر|نوع فایل
|-| یک فایل معمولی
|d|یک دایرکتوری
|l|یک لینک سمبلیک. نکته مهم اینکه لینک‌ها حق دسترسی جداگانه ندارند و حق دسترسی فایل اصلی شرط است. برای یک لینک حق دسترسی همیشه rwxrwxrwx است.
|c|فایل خاص کاراکتری. نماینده سخت‌افزاری است که با داده‌ها به صورت جریانی از بایت‌ها برخورد می‌کند، مانند یک مودم.
|b|فایل خاص بلوکی. نماینده سخت‌افزاری است که با داده‌ها به صورت بلوکی رفتار می‌کند، مانند سی‌دی‌رام و دیسک سخت.


نُه کاراکتر بعدی «مودِ فایل»[^4] نامیده می‌شود. سه کاراکتر اول شامل حق خواندن و نوشتن و اجرا کردن برای مالک فایل، سه تای بعدی همین‌ها برای گروه فایل و سه تای آخری هم به همین ترتیب برای سایر کاربران است.

در اینجا بد نیست که مروری هم داشته باشیم بر تفاوت‌های حق دسترسی‌ها برای فایل‌ها و دایرکتوری‌ها.

| کاراکتر| برای فایل‌ها| برای دایرکتوری‌ها
| r| امکان باز کردن و خواندن محتوای یک فایل| اجازه لیست کردن محتوای دایرکتوری را می‌دهد به شرط اینکه مشخصه اجرایی (x) برای دایرکتوری ست شده باشد.
|w|اجازه نوشتن روی یک فایل یا حذف محتوای آنرا می‌دهد. این مشخصه امکان تغییر نام یا حذف فایل را  نمی‌دهد. این موارد توسط مشخصات دایرکتوری روشن می‌شود.| اجازه ایجاد و تغییر نام و حذف فایل‌های داخل یک دایرکتوری را می‌دهد به شرط اینکه مشخه اجرایی (x)
|x|اجازه می‌دهد با یک فایل مثل یک برنامه رفتار کنیم. نکته جالب اینکه اگر فایل اسکریپت باشد − مثل پایتون − باید علاوه بر این قابل خواندن هم باشد. چرا که اینگونه فایل‌ها در ابتدا خوانده شده و سپس توسط برنامه دیگری اجرا می‌شوند.| اجازه وارد شدن به یک دایرکتوری را می‌دهد، مثلا با دستور cd

## معادل عددی حق دسترسی
از جایی که در بخش اول جزئیات حق دسترسی را شرح داده‌ایم در اینجا معادل‌های عددی آنها را شرح می‌دهیم. نمایش عددی حق دسترسی‌ها در مبنای هشت است بنابراین باید با این دستگاه اعداد آشنا بشویم.

### دستگاه اعداد مبنای هشت
برای فهم مبناهای مختلف در دستگاه‌های اعداد کافیست به تعداد انگشتانمان نگاه کنیم. ما و اجدادمان ده انگشت داریم، به همین خاطر شمارش را با آنها شروع کردیم و مبنای دستگاه اعدادمان شد ده. کامپیوتر از سوی دیگر فقط یک انگشت دارد که آنرا در دو حالت ۰ و ۱ بکار می‌برد و دستگاه اعدادش می‌شود دودویی یا باینری. اگر ما هشت انگشت داشتیم دستگاه اعداد ما می‌شد [مبنای هشت](https://fa.wikipedia.org/wiki/%D8%AF%D8%B3%D8%AA%DA%AF%D8%A7%D9%87_%D8%A7%D8%B9%D8%AF%D8%A7%D8%AF_%D9%BE%D8%A7%DB%8C%D9%87_%DB%B8)[^5] و اگر شانزده تا داشتیم می‌شد مبنای شانزده یا *hexadecimal*.
مهمترین علت بکارگیری دستگاه‌های اعداد پایه هشت و شانزده جهت آسودگی کار با کامپیوتر است. مثلا بجای 01011111 در دستگاه *hex* می‌توان نوشت 5F یا بجای 111000000 می‌توان نوشت 700.


از جایی که هر رقم در مبنای هشت با سه بیت نمایش داده می‌شود، این دستگاه اعداد روش خوبی برای نمایش مود فایل است. همانطور که پیشتر دیدیم مود فایل با نُه بیت نشان داده می‌شود که در مبنای هشت می‌توان آنرا به سه رقم نمایش داد. بسیاری از مدیران سیستم برای تغییر حق دسترسی فایل‌ها از این اعداد استفاده می‌کنند چون پس از یادگیری ساده‌تر و گویاتر است. جدول زیر نمایش حق دسترسی‌ها در مبنای هشت است.


{:.ltr .center}
|مبنای هشت|دودویی|مود فایل
|0|000|---
|1|001|--x
|2|010|-w-
|3|011|-wx
|4|100|r--
|5|101|r-w
|6|110|rw-
|7|111|rwx

حالا می‌توان در تمام دستورات مربوط به حق دسترسی به جای حروف اختصار مستقیما از این اعداد استفاده کرد:

~~~bash
mehdi@debian:~$ > foo.txt
mehdi@debian:~$ ls -l foo.txt 
-rw-r--r-- 1 mehdi mehdi 0 Aug 30 22:42 foo.txt
mehdi@debian:~$ chmod 600 foo.txt 
mehdi@debian:~$ ls -l foo.txt 
-rw------- 1 mehdi mehdi 0 Aug 30 22:42 foo.txt
~~~

پی‌نوشت: من در این مطلب از کتاب بسیار خوب The Linux Command Line کمک گرفتم که از [سایت کتاب](http://linuxcommand.org) به رایگان قابل [دانلود](http://sourceforge.net/projects/linuxcommand/files/TLCL/13.07/TLCL-13.07.pdf/download) است.

[^1]: Multi-tasking
[^2]: inode
[^3]: File attributes
[^4]: File mode
[^5]: Octal
