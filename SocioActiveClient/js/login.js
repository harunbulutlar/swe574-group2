$(document).ready(readyCallback); // end document.ready
var indexPage = "/Angular_Seed_Project/index.html";

function readyCallback()
{
    $('#login').click(onLoginClick);
    $('#register').click(onRegisterClick);
}
/**
 * Created by Harun on 3/14/2015.
 */
function onLoginClick()
{
    $.ajax({
        url: '',
        type:'POST',
        data:
        {
            email: '',
            message: ''
        }
    }).done(function()
    {
        window.location.replace(indexPage);
    })
}

function onRegisterClick()
{
    $.ajax({
        url: '',
        type:'POST',
        data:
        {
            email: '',
            message: ''
        }
    }).done(function()
    {
        window.location.replace(indexPage);
    })
}