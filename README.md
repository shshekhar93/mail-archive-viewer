A service to quickly and easily make your mail archives in mbox format accessible in an mail client like User Interface. Mbox is a (losely docmented but) popular file format for storing emails. It is natively used by various mail clients for saving emails, and also used by major email providers for exporting emails from an account.

# Motivation
Well, I ran out of cloud storage on my primary email account. As I had done previously with other media stored in cloud, I wished to just export all emails and store it on my NAS box. After that, at least the large emails with megabytes of attachment could be deleted from 'cloud'. A search ensued for a plugin that could import and index an mbox file. Alas, the best option I found was to run a gui mail client in a Docker container. A GUI app on a headless server... That didn't sit right with me. It would most likely also have been taxing on my puny NAS server. 

Thus begun this journey. It sure does sound like an use-case other must have had. Perhaps I didn't search far enough corners in the bowels of the internet. If there existed other options, henceforth we shall have one more. Else, long live `Mail Archive Viewer``.

# Features
1. Basic
   1. ✔ Import and index an mbox file [P0]
   2. User Interface with basic features
      1. List emails [P0]
      2. View email content [P0]
      3. View email sender and recipient details [P0]
      4. Download attachment [P0]
   3. Group emails by Labels / Folder [P0]
2. Advanced
   1. Search emails
      1. By sender [P1]
      2. By recipient [P1]
      3. ✔ By English keywords [P1]
      4. By non-English keyword [P3]
      5. By subject (including partial search) [P1]
      6. By fulltext [P3]
      7. By attachment [P3]
   2. Threads view for related emails [P2]
   3. Merged view for two mbox files, skipping duplicates from newer file [P2]
   4. Support mbox archives from other mail providers [P3]

# Installation
This repo contains a Dockerfile to build an image, and run the server in a Docker container. Map the folder containing your mbox files to /archives in the container. All new .mbox files in the folder will automatically be scanned and imported on startup. Once started, port 8000 on the container will serve the web ui to access the emails from mbox files in the archives folder.

PS: Please read Implementation notes before using this software.

# Implementation notes
This software doesn't duplicate the content of emails internally. The emails will only be accessible as long as the original .mbox file is available with the same name in the /archives folder within container. Since my intention was to add view + search on top of an 'archive' file, the mbox file is never opened in write or update mode, but is read whenver the UI requests an email's content / attachment. You must ensure that the original mbox files are not deleted or overwritten in future. If you intentionally want to remove emails from an old mailbox by deleting/overwriting a mbox file (like when updating the file with a superset), delete the mailbox from UI as well and restart the container to start afresh. 

# FAQ
### I added a new .mbox file in the archives folder but it doesn't show up in UI.
New files are only scanned and imported on startup. Just restart your container to import the new file. Existing files will not be re-processed.

### I deleted/updated an exising .mbox file, its all messed up now.
This service reads the email contents on demand from the original mbox. If the mbox file is not found, or has different content, all future email lookups will fail. Delete the mailbox from UI and restart the container to remove all older email references and start afresh.

### Something else's not working
Raise an issue [here](https://github.com/shshekhar93/mail-archive-viewer/issues) with the details, or a pull request with the fix :-)
