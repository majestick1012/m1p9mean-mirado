// main.js
const messageDiv = document.querySelector('#message')
const update = document.querySelector('#update-button')
update.addEventListener('click', _ => {
// Send PUT Request here
fetch('/quotes', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
name: document.querySelector('#namenode').value,
quote: document.querySelector('#quotenode').value,
})
}).then().then(response=> {
        
    //messageDiv.textContent = "miova "+response;
    window.location.reload(true);      
});
})

const deleteButton = document.querySelector('#delete-button');

deleteButton.addEventListener('click',_=>{
    fetch('/quotes',
    {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        name: document.querySelector('#namenode').value
        })
    }).then().then(response=> {
               
        window.location.reload(true);      
    })                     
        
})

//const updatedynamique = document.querySelector('#update-button')
function updated(obj)
{
    // updatedynamique.addEventListener('click', _ => {
        // Send PUT Request here
        fetch('/quotes', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        // name: document.querySelector('#namenode').value,
        name: obj.id,
        quote: document.querySelector('#quotenode').value,     
        namenode:document.querySelector('#namenode').value
        })
        }).then().then(response=> {
                
            //messageDiv.textContent = "miova "+response;
            window.location.reload(true);      
        });
        // })
}

//const updatedynamique = document.querySelector('#update-button')
function deleted(obj)
{
    // updatedynamique.addEventListener('click', _ => {
        // Send PUT Request here
        fetch('/quotes', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        // name: document.querySelector('#namenode').value,
        name: obj.id,
        // quote: document.querySelector('#quotenode').value,     
        // namenode:document.querySelector('#namenode').value
        })
        }).then().then(response=> {
                
            //messageDiv.textContent = "miova "+response;
            window.location.reload(true);      
        });
        // })
}
