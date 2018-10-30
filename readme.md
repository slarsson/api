# GROUPS:
* 0: kan ändra på allt
* 1: 'admin' kan ändra på '2' och alla turneringar
* 2: vanliga användare, kan ändra på sig själv + egna turneringar

# PATH:
** login krävs för allt utom ./

### ./
ALL:
* t: id, vilket turnering
* type: vad som ska hämtas, skiljs med ':' (EX: groups:bracket:name)

### ./user/
GET:

POST: 
* [username, password]

PATCH:
* username: behövs ej för att redigera sig själv
* password: nytt lösenord
* current_password: nuvarande lösenord, behövs endast för att ändra sig eget
* email: byt email
* data: test (?)

DELETE:
* username: vem som ska bort

### ./login/
POST:
* [username, password]

### ./logout/
POST:

### ./tournament/
GET:

POST: 

PATCH:
* t: id, turnering att ändra
* add: lägg till en eller flera 'owners'
* remove: ta bort en eller flera 'owners'
* name: byt namn
* text: ändra text
* 0,1,2, osv: ange array index för att ändra lagnamn, ex: '?2=aik&4=hammarby' 

DELETE:
* t: id, vilket turnering att ta bort

# ÖVRIGT
## VIKTIGT:
Fixa korrekta cors-headers

## GROUPS:
0: root : kan ändra på 'admin'
1: admin : kan ändra på 'users' + lägga till nya användare
2: users : ''

## OKLART (?)
* ta bort '_id' från find och find_all
* null eller "null" för input?
* request limit?
* findandmodify?
* mongodb indexering??