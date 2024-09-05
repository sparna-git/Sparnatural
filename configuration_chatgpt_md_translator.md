## Installation 

* Installer [Node.js](https://nodejs.org/en/download/package-manager/current)
* Installer l'api: 

```
npm install --global chatgpt-md-translator
```

ou

```
npm install chatgpt-md-translator
```

* Le fichier de config `.chatgpt-md-translator`
	* Ajouter l'api key 
		_OPENAI_API_KEY_="XXxXXXXXX"

* Le fichier de prompt se trouve dans `.prompt.md`


## Comme lancer l'api

1. Supprimer le répertoire `docs/fr`
2. Le recréer
3. Copier dans ce répertoire tous les fichiers *.md à traduire
4. Lancer la commande

`npx chatgpt-md-translator docs/fr/*.md docs/fr/*/*.md`
