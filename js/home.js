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
