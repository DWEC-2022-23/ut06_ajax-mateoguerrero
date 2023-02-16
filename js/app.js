const url = "http://localhost:3000/invitados";

let nextId = 1;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');
  
  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');
  
  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckBox = document.createElement('input');
  
  filterLabel.textContent = "Ocultar los que no hayan respondido";
  filterCheckBox.type = 'checkbox';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckBox);
  mainDiv.insertBefore(div, ul);
  filterCheckBox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;

    if(isChecked) {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';  
        } else {
          li.style.display = 'none';                        
        }
      }
    } else {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        li.style.display = '';
      }                                 
    }
  });
  
  

  function createLI(text) {
    const id = nextId++;
  
    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);  
      element[property] = value;
      return element;
    }
    
    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);  
      li.appendChild(element); 
      return element;
    }
    
    const li = document.createElement('li');
    appendToLI('span', 'textContent', text);     
    appendToLI('label', 'textContent', 'Confirmed')
    .appendChild(createElement('input', 'type','checkbox'));
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');
    li.setAttribute('data-id', id);
    return li;
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    añadirElemento(text);
    input.value = '';
    const li = createLI(text);
    ul.appendChild(li);
  });

  ul.addEventListener('change', (e) => {
    const checkbox = event.target;
    const checked = checkbox.checked;
    const listItem = checkbox.parentNode.parentNode;
    
    if (checked) {
      listItem.className = 'responded';
    } else {
      listItem.className = '';
    }
  });
    
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      const ul = li.parentNode;
      const action = button.textContent
      const nameActions = {
        remove: () => {
          ul.removeChild(li);
          buscar(e);
        },
        edit: () => {
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'save'; 
          
        },
        save: () => {
            console.log(li.getAttribute("id")) 
            const input = li.firstElementChild;
            const span = document.createElement('span');
            span.textContent = input.value;
            li.insertBefore(span, input);
            li.removeChild(input);
            button.textContent = 'edit'; 
              
            actualizar(li.getAttribute("data-id"), li.querySelector('input[type="checkbox"]').checked, li.querySelector("span").textContent);  
          
           
        }
      };
      
      // select and run action in button's name
      nameActions[action]();
    }

  });

  return new Promise(function resolverUrl(resolve,reject){//creamos una promesa que nos debolvera valor/error 100% cuando el archivo este cargado

    let xhc=new XMLHttpRequest();//objeto de la peticion
    xhc.timeout=2000;//tiempo de ejecucion de la peticion

    xhc.open('GET',url,true); //Primero abrimos la peticion
    xhc.send();

    xhc.onreadystatechange=function(){//una vez que el archivo de peticion esta preparado ejecuta la promesa
        if(xhc.readyState===4){//si esta en estado 4 es que el estado de carga esta completo    
            if(xhc.status=== 200){ //si el estado del fichero eswta correcto 
                //una vez que se ejecita la promesa puede devolver dos estados:resolve[todo bien]
                //reject[fallo]
                let datos = JSON.parse(this.responseText);
                for(let objeto of datos){

                  if(objeto.confirmado == true){

                    const li = createLI(objeto.nombre);
                    li.querySelector("input").checked = true;
                    ul.appendChild(li);

                  }else{

                    const li = createLI(objeto.nombre);
                    ul.appendChild(li);

                  }

                }

            }else{
                reject(xhc.status);
            }
        }
    };

    
    
    xhc.ontimeout=function(){
        reject("time out!!");
    }

})  

function añadirElemento(text){
  return new Promise(function añadir(resolve,reject){
    let xhc=new XMLHttpRequest();
    xhc.open('POST',url,true);

    xhc.setRequestHeader("Content-Type", "application/json");
    let nuevoInvitado = JSON.stringify({"id":0, "nombre": text, "confirmado": false});
    xhc.send(nuevoInvitado);
  })
}

function establecerId(text) {
  
  let promesa =  new Promise(function buscar(){
    let xhc=new XMLHttpRequest();
    xhc.open('GET',url,true);
    xhc.send();
    xhc.onreadystatechange=function(){
      if(xhc.readyState===4){  
          if(xhc.status=== 200){ 

            let datos = JSON.parse(this.responseText);
            for(let objeto of datos){

              if(text == objeto.nombre){
                return objeto.id;
              }

            } 
          }
      }else{
        return xhc.status;
      }
  };

  })
}

function buscar(e){
  return new Promise(function buscar(){
    let xhc=new XMLHttpRequest();
    xhc.open('GET',url,true);
    xhc.send();
    xhc.onreadystatechange=function(){//una vez que el archivo de peticion esta preparado ejecuta la promesa
      if(xhc.readyState===4){//si esta en estado 4 es que el estado de carga esta completo    
          if(xhc.status=== 200){ 

              let nombreTarget=e.target.parentNode.querySelector("span");
              let datos = JSON.parse(this.responseText);
              datos.forEach(element => {

              let boton = e.target.textContent;

              //console.log(boton);

                  if(element.nombre == nombreTarget.innerHTML && boton == "remove"){

                    borrarJSON(element.id);

                  }
                  if(boton == "save"){

                    actualizar(element.id);

                  }
              });
               
          }
      }else{
        return xhc.status;
      }
  };

  })
}

function borrarJSON(id){
  return new Promise(function borrarJson(){
    let xhr=new XMLHttpRequest();
    xhr.open('DELETE',"http://localhost:3000/invitados/"+id,true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
  })
}

function actualizar(id, confirmado, nombre) {
  fetch(`http://localhost:3000/invitados/` + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre: nombre,
      confirmado: confirmado
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}



}

);  
