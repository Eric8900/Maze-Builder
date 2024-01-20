let pathWidth = 10       
let wall = 2            
let outerWall = 2     
let width = 25     
let height = 25   
let delay = 0    
let x = 0    
let y = 0    
let cnt = 0;
var grid = createEmptyGrid(height, width);
let directions = [[1,0],[-1,0],[0,1],[0,-1]];
seed = Math.random()*100000|0
let wallColor = '#009be3' 
let pathColor = '#002638'
let sol = document.getElementById('solution');

randomGen = function(seed){
    if(seed === undefined) seed=performance.now()
    return function(){
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
    }
}

function createEmptyGrid(n, m) {
    return Array.from({ length: n }, () => Array(m).fill(0));
}

function init(){
    offset = pathWidth/2+outerWall
    map = []
    cnt = 0;
    sol.style.visibility = 'hidden';
    sol.value = "Show Solution";
    grid = createEmptyGrid(height, width);
    canvas = document.querySelector('canvas')
    ctx = canvas.getContext('2d')
    canvas.width = outerWall * 2 + width * (pathWidth + wall) - wall
    canvas.height = outerWall * 2 + height * (pathWidth + wall) - wall
    ctx.fillStyle = wallColor
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(0,0, pathWidth + 3, pathWidth + 3)
    ctx.fillRect(canvas.width - pathWidth - 3, canvas.height - pathWidth - 3, pathWidth + 3, pathWidth + 3)
    random = randomGen(seed)
    ctx.strokeStyle = pathColor
    ctx.lineCap = 'square'
    ctx.lineWidth = pathWidth
    ctx.beginPath()
    for(let i = 0; i < height * 2; i++){
        map[i] = []
        for(let j = 0; j < width * 2; j++){
            map[i][j] = false
        }
    }
    map[y * 2][x * 2] = true;
    route = [[x , y, []]]
    // console.log(x + " " + y);
    ctx.moveTo(x * (pathWidth + wall) + offset, y * (pathWidth + wall) + offset)
}
init()

inputWidth = document.getElementById('width')
inputHeight = document.getElementById('height')
inputSeed = document.getElementById('seed')
buttonRandomSeed = document.getElementById('randomseed')

settings = {
    display: function(){
        inputWidth.value = width
        inputHeight.value = height
        inputSeed.value = seed
    },
    check: function(){
        if(inputWidth.value != width||
        inputHeight.value != height||
        inputSeed.value != seed){
        settings.update()
        }
    },
    update: function(){
        clearTimeout(timer)
        width = parseFloat(inputWidth.value)
        height = parseFloat(inputHeight.value)
        seed = parseFloat(inputSeed.value)
        x = 0
        y = 0
        init()
        main()
    }
}

buttonRandomSeed.addEventListener('click',function(){
  inputSeed.value = Math.random()*100000|0
})

function prom() {
    return new Promise((resolve, reject) => {
        function loop() {
        if (cnt === (width * height) - 1) {
            resolve();
            return;
        }
        // random bfs
        x = route[route.length-1][0]|0
        y = route[route.length-1][1]|0
        path = route[route.length-1][2]

        let alternatives = [];

        for(let i = 0; i < directions.length; i++){
            // console.log((directions[i][1]+y)*2 + " " + (directions[i][0]+x)*2);
            if(map[(directions[i][1]+y)*2] != undefined && map[(directions[i][1]+y)*2][(directions[i][0]+x)*2] === false){
                alternatives.push(directions[i])
            }
        }

        if(alternatives.length === 0){
            route.pop()
            if(route.length>0){
                ctx.moveTo(route[route.length-1][0]*(pathWidth+wall)+offset, route[route.length-1][1]*(pathWidth+wall)+offset);
                // timer = setTimeout(() => {
                //     loop();
                // }, delay);
                timer = setTimeout(loop, delay);
            }
            return;
        }
        direction = alternatives[random()*alternatives.length|0]
        // console.log((direction[0]+x)*(pathWidth+wall)+offset);
        // console.log(x + " " + y);
        // if (x == width - 1 && y === height - 1) {
        //     sol = path;
        //     console.log(sol);
        //     for (let r = sol.length - 1; r >= 0; r) {
        //         ctx.strokeStyle = '#FFFFFF';
        //         ctx.lineTo((direction[0]+sol[r][0])*(pathWidth+wall)+offset, (direction[1]+sol[r][1])*(pathWidth+wall)+offset);
        //         ctx.stroke();
        //     }
        // }
        cnt++;
        grid[direction[1]+y][direction[0]+x] = grid[y][x] + 1;
        ctx.strokeStyle = pathColor;
        route.push([direction[0]+x,direction[1]+y]);
        ctx.lineTo((direction[0]+x)*(pathWidth+wall)+offset, (direction[1]+y)*(pathWidth+wall)+offset);
        map[(direction[1]+y)*2][(direction[0]+x)*2] = true;
        map[direction[1]+y*2][direction[0]+x*2] = true;
        ctx.stroke();
        // timer = setTimeout(() => {
        //     loop().then(resolve);
        // }, delay);
        timer = setTimeout(loop, delay);
        }
        loop();
    });
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function solve() {
    let start = { x: 0, y: 0 };
    let end = { x: width - 1, y: height - 1 };
    let openSet = [start];
    let closedSet = [];
    let path = [];
    let source = new Map();

    let gScore = [];
    let fScore = [];
    for(let i = 0; i < height; i++) {
        gScore[i] = new Array(width).fill(Infinity);
        fScore[i] = new Array(width).fill(Infinity);
    }
    gScore[start.y][start.x] = 0;
    fScore[start.y][start.x] = heuristic(start, end);

    while(openSet.length > 0) {
        let current = openSet.reduce((a, b) => fScore[a.y][a.x] < fScore[b.y][b.x] ? a : b);
        
        if(current.x === end.x && current.y === end.y) {
            while(current !== start) {
                path.push(current);
                current = source.get(current);
            }
            path.push(start);
            path.reverse();
            return path;
        }

        openSet = openSet.filter(pt => pt !== current);
        closedSet.push(current);

        for(let dir of directions) {
            let neighbor = { x: current.x + dir[0], y: current.y + dir[1] };
            if (neighbor.x >= 0 && neighbor.x < width && neighbor.y >= 0 && neighbor.y < height && grid[neighbor.y][neighbor.x] === grid[current.y][current.x] + 1) {
                // console.log(neighbor.x + " " + current.x + " " + neighbor.y + " " + current.y);
                // console.log(grid[neighbor.y][neighbor.x] + " " + grid[current.y][current.x]);
                if (closedSet.some(pt => pt.x === neighbor.x && pt.y === neighbor.y)) {
                    continue;
                }

                if (!openSet.some(pt => pt.x === neighbor.x && pt.y === neighbor.y)) {
                    openSet.push(neighbor);
                }

                let tentativeGScore = gScore[current.y][current.x] + 1;
                if (tentativeGScore >= gScore[neighbor.y][neighbor.x]) {
                    continue;
                }

                // check better and sht
                source.set(neighbor, current);
                gScore[neighbor.y][neighbor.x] = tentativeGScore;
                fScore[neighbor.y][neighbor.x] = gScore[neighbor.y][neighbor.x] + heuristic(neighbor, end);
            }
        }
    }
    return [];
}

function drawPath(color, index = 0) {
    return new Promise((resolve, reject) => {
        function draw(i) {
            if (i === 0) {
                ctx.save(); 
                ctx.strokeStyle = color; 
                ctx.beginPath(); 
                ctx.moveTo((solution[0].x) * (pathWidth + wall) + offset, (solution[0].y) * (pathWidth + wall) + offset);
            }

            if (i < solution.length) {
                ctx.lineTo((solution[i].x) * (pathWidth + wall) + offset, (solution[i].y) * (pathWidth + wall) + offset);
                ctx.stroke();
                setTimeout(() => {
                    draw(i + 1);
                }, delay); 
            } else if (i === solution.length){
                ctx.restore();
                resolve();
                return;
            }
        }
        draw(index);
    });
}

sol.addEventListener('click', function() {
    sol.style.visibility = 'hidden';
    if (sol.value === "Show Solution") {
        sol.value = "Hide Solution";
        async function d() {
            await drawPath('#FFFFFF');
            sol.style.visibility = 'visible';
        }
        d();
    }
    else {
        sol.value = "Show Solution";
        async function d() {
            await drawPath(pathColor);
            sol.style.visibility = 'visible';
        }
        d();
    }
});
async function main() {
    await prom();
    solution = solve();
    console.log(solution);
    sol.style.visibility = 'visible';
}
main();
// loop();
// p = solve();
// console.log(p);
settings.display()
setInterval(settings.check,400)