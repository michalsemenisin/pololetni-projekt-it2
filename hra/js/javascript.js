// Konstanty hráče
var sirkaPostavy = 180;
var vyskaPostavy = 120;
var zrychleniPostavy = 1;
var postavaXRychlost = 5;
var rychlostSkoku = 25; // Zvýšení rychlosti
var maximalniZivoty = 100;
// Konstanty enemies
var nepritelVyska = 110;
var nepritelSirka = 140;
var maximalniPocetNepritelu = 10;
var minVzdalenostMeziNepriteli = 200;
var maxVzdalenostMeziNepriteli = 800;
var nepritelRychlost = 4;
// Konstanty hry
var sirkaHry = 1000;
var vyskaHry = 600;
var mezernik = 32;
var zemeY = 500; //Hranite země po které postava běží
var sirkaPozadi = 1000;
var hrani = 0;
var gameOver = 1;
// Nastavení plátna
var c = document.getElementById("canvas");
canvas.height = vyskaHry;
canvas.width = sirkaHry;
var c = canvas.getContext('2d');
// Načítání obrázků
var postavaImage = new Image();
postavaImage.src = 'postava1.png';

var pozadiImage = new Image();
pozadiImage.src = 'pozadi1.png';

var nepritelImage = new Image();
nepritelImage.src = 'nepritel7.png';

var nepritel = [{
    x: 1000,
    y: (zemeY - nepritelVyska) + 20
}]

var hitDamage = 20;
var kameraX = 0; // Proměnné vztahující se k počátku plátna
var kameraY = 0; // Proměnné vztahující se k počátku plátna
var postavaX = sirkaHry / 2;  // Proměnné k odstranění zbytku barvy nebe při pohybu pozadí
var postavaY = zemeY - vyskaPostavy; // Proměnné k odstranění zbytku barvy nebe při pohybu pozadí
var postavaYRychlost = 0;
var postavaVeVzduchu = false;
var mezernikStisknuty = false;
var postavaZdravi = maximalniZivoty;

var hraMod = hrani;

window.addEventListener('keydown', onkeydown);
window.addEventListener('keyup', onkeyup);

window.addEventListener('load', start);

function start(){
    window.requestAnimationFrame(hlavniLoop);
}
//Hlavní smyčka
function hlavniLoop(){
    update();
    draw();
    window.requestAnimationFrame(hlavniLoop);
}

function onkeydown(event) {
    if (event.keyCode === mezernik) {
        mezernikStisknuty = true;
    }
}
function onkeyup(event) {
    if (event.keyCode === mezernik) {
        mezernikStisknuty = false;
    }
}

function update(){
    // Pokud hra skončí, nemusí se hra znovu aktualizovat
    if (hraMod != hrani) return;
    postavaX = postavaX + postavaXRychlost;
    // Poznání, zda je postava na zemi
    if (mezernikStisknuty && !postavaVeVzduchu){
        postavaYRychlost = -rychlostSkoku;
        postavaVeVzduchu = true;
    }
    // Rychlost padání
    postavaY = postavaY +1;  // 1 je rychlost, kterou padá
    postavaY = postavaY + postavaYRychlost;
    //Během pádu k zemi postava zrychluje
    postavaYRychlost = postavaYRychlost + zrychleniPostavy;
    // Zabránění vypadnutí z obrazovky (pokud je souřadnice Y postavy větší, než Y země, tak se znovu srovná se zemí)
    if (postavaY > (zemeY - vyskaPostavy)) {
        postavaY = zemeY - vyskaPostavy;
        postavaYRychlost = 0;
        postavaVeVzduchu = false;
    }
    // Pohyb kamery
    kameraX = postavaX - 150; // Kamera se má ukazovat 150 px od postavy
    // Konec hry, kontrola zda hra skončila
    if (postavaZdravi <= 0) {
        hraMod = gameOver;
    }

    // Logika enemies
    var nepritelIndex = 0;
    while (nepritelIndex < nepritel.length){
        if (nepritel[nepritelIndex].x < kameraX - nepritelSirka) {
            nepritel.splice(nepritelIndex, 1);
        } else {
            nepritelIndex += 1;
        }
    }

    if (nepritel.length < maximalniPocetNepritelu) {
        var posledniNepritelX = nepritel[nepritel.length - 1].x;
        var novyNepritelX = posledniNepritelX + maxVzdalenostMeziNepriteli + Math.random() * (maxVzdalenostMeziNepriteli - minVzdalenostMeziNepriteli);
        nepritel.push({
            x: novyNepritelX,
            y: (zemeY - nepritelVyska) + 20
            
        });
    }
    // Kolizní logika
 for(var i = 0; i < nepritel.length;i++){
    nepritel[i].x -= nepritelRychlost; //Posuv nepřítele směrem k postavě
        if(
            ((postavaX + postavaImage.width >= nepritel[i].x && postavaX + postavaImage.width <= nepritel[i].x + nepritelImage.width) && (postavaY + postavaImage.height >= nepritel[i].y) && (!nepritel[i].hit)) || 
            ((postavaX >= nepritel[i].x && postavaX <= nepritel[i].x + nepritelImage.width) && (postavaY + postavaImage.height >= nepritel[i].y) && (!nepritel[i].hit))
            ){
                nepritel[i].hit = true;
                postavaZdravi -= hitDamage; //Odečítání životů
        }
    }
}
//vyklesleni postavy a prostredi
function draw(){
    // Vykreslení nebe
    c.fillStyle = 'black';
    c.fillRect(0, 0, sirkaHry, zemeY - 30);
    // Vykreslení pozadí
    var pozadiX = - (kameraX % sirkaPozadi);
    c.drawImage(pozadiImage, pozadiX, -145);
    c.drawImage(pozadiImage, pozadiX + sirkaPozadi, -145);
    // Vykreslení podlahy
    c.fillStyle = 'white';
    c.fillRect (0, zemeY - 40, sirkaHry, vyskaHry - zemeY + 40);
    // Vykreslení nepřátel
    for (var i = 0; i < nepritel.length; i++){
        c.drawImage(nepritelImage, nepritel[i].x - kameraX, nepritel[i].y - kameraY);
    }    
    // Vykreslení postavy
    c.drawImage(postavaImage, postavaX - kameraX, postavaY - kameraY);

    // Vykreslení skóre
    var vzdalenostPostavy = (postavaX / 100) - 4;
    c.fillStyle = 'white';
    c.font = '48px sans-serif';
    c.fillText(vzdalenostPostavy.toFixed(0) + 'm', 20, 40);

    // Vykreslení baru životů
    c.fillStyle = 'red';
    c.fillRect(550, 20, postavaZdravi / maximalniZivoty * 400, 30);
    c.strokeStyle = 'red';
    c.strokeRect(550, 20, 400, 30);

    // Pokud nastane konec hry, tak to napíše 'GAME OVER'
    if (hraMod == gameOver) {
        c.fillStyle = 'white';
        c.font = '96px sans-serif';
        c.fillText('GAME OVER', 190, 300);
    }
}
    // Zajištění, aby se stránka nehýbala při zmáčknutí spacebaru, či šipek
    var arrow_keys_handler = function(e) {
        switch(e.keyCode){
            case 37: case 39: case 38:  case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    };
    window.addEventListener("keydown", arrow_keys_handler, false);