const app = {
  defaultPage: 'home',
  api :'http://localhost:4005',
  templates: new Map(),
  controllers: {},
  content: document.getElementById('app'),
};


app.init = function () {
  window.addEventListener('hashchange', () => {
      const tplName = window.location.hash.slice(1);
      app.displayTpl(tplName);
  });

  this.navigate(this.defaultPage);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

app.navigate = (path) => {
  window.location.hash = `#${path}`;
}


app.displayTpl = async (tpl) => {
  //récupérer le tpl 
  if (!app.templates.has(tpl)) {
      await app.loadTemplate(tpl);
  }
  const _tpl = app.templates.get(tpl);
  app.content.innerHTML = _tpl;
  // INIT controller
  if(app.controllers[tpl] != null) {
      app.controllers[tpl].init();
  }
}

app.loadTemplate = function (tpl) {
  return $.ajax({
      type: 'GET',
      url: `tpl/${tpl}.tpl.html`,
      dataType: 'html',
  }).then((data) => {
      app.templates.set(tpl, data);
  }).fail(() => {
      alert('Impossible de récupérer le template');
  });
}



app.init();
const home = {
    data: [],
};

home.init = async function () {
    // get DOM elements

    home.tableContent = document.querySelector('#container-list table tbody');

    home.data = await home.getAll().catch(() => {
            alert('Impossible de récupérer les budgets');
            return [];
    });
        
    home.renderTable();
}
home.renderTable = () => {
    let content = '';
    home.data.forEach((e, index) => {
        content += `
        <tr>
            <td>${e.id}</td>
            <td>${e.name}</td>
            <td>
                <button class="btn btn-primary" onclick="home.edit(${index})">M</button>
                <button class="btn btn-danger" onclick="home.remove(${index})">S</button>
            </td>
        </tr>
        `;
    });

    home.tableContent.innerHTML = content;
}

home.toggleForm = () => {
    $('#home-form form input').val('');
    $('#container-list, #home-form').toggle();
}

home.save = async (event) => {
    event.preventDefault();
    const id = $('input[name="id"]').val();
    const name = $('input[name="name"]').val();
    if(name.trim().length === 0) {
        alert('Tous les champs sont obligatoires !!!');
        return;
    }
    
    const record = home.data.find(d => d.id == id);
    // EDITION
    try{
        if(record) {
            const homeSaved = await $.ajax({
                type: 'PUT',
                url: `${app.api}/lst_budget/${record.id}`,
                data: { name }
            })
            record.name = homeSaved.name;
        } 
        // AJOUT
        else {
            const homeSaved = await $.ajax({
                type: 'POST',
                url: `${app.api}/lst_budget`,
                data: { name }
            })
            home.data.push(homeSaved);
            Swal.fire(
                'Budjet ajoutée!',
                'Opération réussie.',
                'success'
              )
        }

        home.renderTable();
        home.toggleForm();
        Swal.fire( {
            icon: 'success',
            title: 'Succès',
          })
    } catch(e) {
        alert(record ? 'Impossible de modifier ce budget' : 'Impossible d\'ajouter ce budget');
    }
};

home.edit = (index) => {
    home.toggleForm();
    if (index !== undefined) {
        home.fillForm(index);
    }
};

home.fillForm = (index) => {
    const record = home.data[index];
    if(record != null) {
        $('input[name="id"]').val(record.id);
        $('input[name="name"]').val(record.name);
    }
};

home.remove = async (index) => {
    const record = home.data[index];
    if (record != null) {
        try {
          Swal.fire({
            title: `Voulez-vous vraiment supprimer ce budget: ${record.name} ?`,
            text: "Cette action est irreversible!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, j'en suis sûr!",
          }).then(async ({ value }) => {
            if (value) {
              await $.ajax({
                type: "DELETE",
                url: `${app.api}/budget/${record.id}`,
              });
              budget.data.splice(index, 1);
              budget.renderList();
            }
          });
        } catch (e) {
          alert("Impossible de supprimer ce budget !");
        }
      }
    };


home.getAll = () => {
    return $.ajax({
        type: 'GET',
        url: `${app.api}/lst_budget`,
    })
};

app.controllers.home = home;

const budget = {
  data: [],
};

budget.init = async function () {
  // Récupération des éléments DOM
  budget.totalAmount = document.getElementById("total-amount");
  budget.totalAmountButton = document.getElementById("total-amount-button");
  budget.userAmount = document.getElementById("user-amount");
  budget.checkAmountButton = document.getElementById("check-amount");
  budget.productTitle = document.getElementById("product-title");
  budget.errorMessage = document.getElementById("budget-error");
  budget.productTitleError = document.getElementById("product-title-error");
  budget.productCostError = document.getElementById("product-cost-error");
  budget.amount = document.getElementById("amount");
  budget.expenditureValue = document.getElementById("expenditure-value");
  budget.balanceValue = document.getElementById("balance-amount");
  budget.list = document.getElementById("list");
  budget.amount = 0;
  const {budgetData} = budget.renderList;
  const labels = []; // Créer un tableau de labels
  const values = []; // Créer un tableau de valeurs
  


  const data = {
    labels: labels,
    datasets: [{
      label: 'Dépenses',
      data: values,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };
  
  const config = {
    type: 'bar',
    data: data,
    options: {
      backgroundColor: 'black'
    }
  };
  
  budget.data.forEach((budget) => {
    labels.push(budget.productTitle); // Ajouter le titre du produit comme label
    values.push(parseInt(budget.userAmount)); // Ajouter le montant d'utilisateurs comme valeur (converti en nombre entier)
  });
  
  const ctx = document.getElementById('myChart').getContext('2d');
  const myChart = new Chart(ctx, config);

  // Récupération des budgets existants
  budget.data = await budget.getAll().catch(() => {
    alert("Impossible de récupérer les budgets");
    return [];
  });

  budget.tableContent = document.querySelector(
    "#budget-container-list table tbody"
  );

  budget.renderList();

  // Ajouter l'événement d'écoute

  if (budget.checkAmountButton) {
    budget.checkAmountButton.addEventListener("click", handleClick);
  }

};

// Fonction pour récupérer tous les budgets
budget.getAll = () => {
  return $.ajax({
    type: "GET",
    url: `${app.api}/budget`,
  });
};

// Fonction pour afficher la liste des dépenses
budget.renderList = () => {
  let content = "";
  budget.data.forEach((e, index) => {
    content += `
        <tr>
            <td>${e.id}</td>
            <td>${e.productTitle}</td>
            <td>${e.userAmount}</td>
            <td>
                <button class="btn btn-primary" onclick="budget.edit(${index} )">M</button>
                <button class="btn btn-danger" onclick="budget.remove(${index} )">S</button>
            </td>
        </tr>
      `;
  });
  budget.tableContent.innerHTML = content;
};

// Fonction pour désactiver les boutons "Modifier" et "Supprimer"
disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

// Fonction pour afficher/cacher le formulaire d'ajout de budget
budget.toggleForm = () => {
  $('input[name="id"]').val();
  $("#budget-form form input").val("");
};

budget.edit = (index) => {
  budget.toggleForm();
  if (index !== undefined) {
    budget.fillForm(index);
  }
};

budget.fillForm = (index) => {

  const record = budget.data[index];
  if (record != null) {
    $('input[id="id-budget"]').val(record.id);
    $('input[id="product-title"]').val(record.productTitle);
    $('input[id="user-amount"]').val(record.userAmount);
  }
};

budget.remove = async (index) => {
  const record = budget.data[index];

  if (record != null) {
    try {
      Swal.fire({
        title: `Voulez-vous vraiment supprimer ce budget: ${record.productTitle} ?`,
        text: "Cette action est irreversible!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, j'en suis sûr!",
      }).then(async ({ value }) => {
        if (value) {
          await $.ajax({
            type: "DELETE",
            url: `${app.api}/budget/${record.id}`,
          });
          budget.data.splice(index, 1);
          budget.renderList();
        }
      });
    } catch (e) {
      alert("Impossible de supprimer ce budget !");
    }
  }
};

budget.save = async (event) => {
  event.preventDefault();
  const id = $('input[id="id-budget"]').val();
  budget.listCreator = async (expenseName, expenseValue) => {
    let sublistContent = document.createElement("div");
    sublistContent.classList.add("sublist-content", "flex-space");
    list.appendChild(sublistContent);
    sublistContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${expenseValue}</p>`;
    let editButton = document.createElement("button");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
    editButton.style.fontSize = "1.2em";
    editButton.addEventListener("click", () => {
      budget.modifyElement(editButton, true);
    });
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
    deleteButton.style.fontSize = "1.2em";
    deleteButton.addEventListener("click", () => {
      budget.modifyElement(deleteButton);
    });
    sublistContent.appendChild(editButton);
    sublistContent.appendChild(deleteButton);
    document.getElementById("list").appendChild(sublistContent);
    const record = budget.data.find((d) => d.id == id);

    try {
      if (record) {
        const budgetSaved = await $.ajax({
          type: "PUT",
          url: `${app.api}/budget/${record.id}`,
          data: {
            productTitle: expenseName,
            userAmount: expenseValue,
          },
        });
        record.productTitle = budgetSaved.productTitle;
        record.userAmount = budgetSaved.userAmount;
      }
      // AJOUT
      else {
        const budgetSaved = await $.ajax({
          type: "POST",
          url: `${app.api}/budget`,
          data: {
            productTitle: expenseName,
            userAmount: expenseValue,
          },
        });
        budget.data.push(budgetSaved);
        Swal.fire("Budjet ajoutée!", "Opération réussie.", "success");
      }

      budget.renderList();
      budget.toggleForm();
      Swal.fire({
        icon: "success",
        title: "Succès",
      });
    } catch (e) {
      alert(
        record
          ? "Impossible de modifier ce budget"
          : "Impossible d'ajouter ce budget"
      );
    }
  };
};

budget.set = async (event) => {
  event.preventDefault();
  if (!budget.totalAmount.value) {
    budget.errorMessage.classList.remove("hide");
    return false;
  }
  document.getElementById("amount").innerText = budget.totalAmount.value;
  budget.errorMessage.classList.add("hide");
};

// Fonction pour modifier ou supprimer un élément de la liste des dépenses
budget.modifyElement = (element, edit = false) => {
  let parentDiv = element.parentElement;
  let currentBalance = budget.balanceValue.innerText;
  let currentExpense = budget.expenditureValue.innerText;
  let parentAmount = parentDiv.querySelector(".amount").innerText;
  console.log(parentDiv.querySelector(".amount"));
  if (edit) {
    let parentText = parentDiv.querySelector(".product").innerText;
    budget.productTitle.value = parentText;
    budget.userAmount.value = parentAmount;
    disableButtons(true);
  } else {
    budget.balanceValue.innerText =
      parseInt(currentBalance) + parseInt(parentAmount);
    budget.expenditureValue.innerText =
      parseInt(currentExpense) - parseInt(parentAmount);
    parentDiv.remove();
  }
};

const handleClick = () => {
  //empty checks
  if (!budget.userAmount.value || !budget.productTitle.value) {
    budget.productTitleError.classList.remove("hide");
    return false;
  }
  //Expense
  let expenditure = parseInt(budget.userAmount.value);

  //Total expense (existing + new)
  let sum = parseInt(budget.expenditureValue.innerText) + expenditure;

  budget.expenditureValue.innerText = sum;
  //Total balance(budget - total expense)
  const totalBalance = budget.totalAmount.value - sum;

  budget.balanceValue.innerText = totalBalance;
  //Create list
  budget.listCreator(budget.productTitle.value, budget.userAmount.value);
  //Empty inputs
  budget.value = "";
  budget.userAmount.value = "";
  budget.productTitleError.classList.add("hide");
};

app.controllers.budget = budget;
