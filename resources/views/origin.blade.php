
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <link rel="stylesheet" href="{{ asset('css/origin.css') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <div class="nav">
            <h1>TimeFlow-AD.</h1>
            <nav >
                <a href="/">Home</a>
                <a href="{{ route('register') }}">Register</a>
                <a href="{{ route('login') }}">Login</a>
            </nav>
        </div>
   
        <div class="paragraph">
            <p class="first">TimeFlow - Where every minutes matter.</p>
            <p class="second">Effortless time tracking to boost you.</p>
        </div>
             <div class="btn">
            <form action="{{route("login.post")}}">
                <button>Get Start!</button>
            </form>
        </div>
  </header>
  <section id="sec">
    <div class="section">
        <p>
            Time Flow is a modern digital experience designed to visualize the value of time in our everyday lives.
             It represents how moments pass, evolve, and shape our journey. With a clean interface and smooth interactions, Time Flow helps users understand the rhythm of time—past, present, and future—through thoughtful design and intuitive navigation. This project focuses on simplicity, performance, and meaningful user experience.
        </p>
        <hr>
    </div>
  </section>
  <footer  id="cont">
     <div class="contact">
        <a href="#">ayushdiv@gmail.com</a>
        <a href="#">+91 xxxxxxxxxx</a>
     </div>
  </footer>
</body>
</html>






