import { GithubUser } from "./GithubUser.js"

export class Favorites {
	constructor(root) {
		this.root = document.querySelector(root) //root is #app
		this.load()
	}

	load() {
		this.entries = JSON.parse(localStorage.getItem("@github-gitfav:")) || []
	}

	save() {
		localStorage.setItem("@github-gitfav:", JSON.stringify(this.entries))
	}

	async add(username) {
		try {
			const userExists = this.entries.find((entry) => entry.login == username)
			if (userExists) {
				throw new Error("Usuário já cadastrado.")
			}

			const user = await GithubUser.search(username)

			if (user.login === undefined) {
				throw new Error("Usuário não encontrado.")
			}

			this.entries = [user, ...this.entries]
			this.update()
			this.save()
			this.checkState()
		} catch (err) {
			alert(err.message)
		}
	}

	delete(user) {
		const filteredEntries = this.entries.filter(
			(entry) => entry.login !== user.login
		)

		this.entries = filteredEntries
		this.update()
		this.save()
		this.checkState()
	}
}

export class FavoritesView extends Favorites {
	constructor(root) {
		super(root)

		this.tbody = this.root.querySelector("table tbody")

		this.checkState()
		this.update()
		this.onadd()
	}

	onadd() {
		const addButton = this.root.querySelector(".search button")
		addButton.onclick = () => {
			const element = this.root.querySelector(".search input")
			this.add(element.value)

			element.value = ""
			element.focus()
		}
	}

	update() {
		this.removeAllTr()

		this.entries.forEach((user) => {
			const row = this.createRow()

			row.querySelector(
				".user img"
			).src = `https://github.com/${user.login}.png`
			row.querySelector(".user img").alt = `Imagem de ${user.name}`
			row.querySelector(".user a").href = `https://github.com/${user.login}`
			row.querySelector(".user p").textContent = user.name
			row.querySelector(".user span").textContent = user.login
			row.querySelector(".repositories").textContent = user.public_repos
			row.querySelector(".followers").textContent = user.followers

			row.querySelector(".remove").onclick = () => {
				const removeUser = confirm("Tem certeza que deseja remover esse user?")

				if (removeUser) {
					this.delete(user)
				}
			}

			this.tbody.append(row)
		})
	}

	createRow() {
		const tr = document.createElement("tr")

		const content = `
              <td class="user">
								<img
									src="https://avatars.githubusercontent.com/u/4328398?v=4"
									alt="Imagem do Github"
								/>
								<a href="https://github.com/anna" target="_blank">
									<p>Ana</p>
									<span>ana123</span>
								</a>
							</td>
							<td class="repositories">123</td>
							<td class="followers">1234</td>
							<td><button class="remove">Remover</button></td>
    `

		tr.innerHTML = content

		return tr
	}

	removeAllTr() {
		this.tbody.querySelectorAll("tr").forEach((tr) => {
			tr.remove()
		})
	}

	checkState() {
		if (this.entries.length === 0) {
			this.root.querySelector(".no-state").classList.remove("hide")
		} else {
			this.root.querySelector(".no-state").classList.add("hide")
		}
	}
}
