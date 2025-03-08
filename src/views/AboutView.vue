<template>
  <section class="container mx-auto">
    <div class="flex py-12 lg:h-[520px]">
      <div class="card card-compact bg-base-100 w-96 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Lorem</h2>
          <p>Menuju Tak Terbatas dan Melampauinya</p>
        </div>
        <figure class="bg-cover bg-center">
          <img
            class=""
            src="https://media.discordapp.net/attachments/1164452737262551050/1266051095290187856/1721920484042.jpg?ex=677bf377&is=677aa1f7&hm=7c07312372750cbc9159a9cc346663cada9018040c66a208e995ce9124262643&=&format=webp&width=467&height=700"
            alt="Shoes"
          />
        </figure>
      </div>
      <div class="flex space-x-2 p-5">
        <div class="card lg:flex lg:flex-row bg-gray-400 shadow-xl rounded-[50px]">
          <figure class="lg:w-96 lg:h-96 rounded-[50px]">
            <img
              src="https://media.discordapp.net/attachments/1164452737262551050/1325512475285913690/IMG_20250105_214736_749.jpg?ex=677c0f30&is=677abdb0&hm=eba24fad9de410ca6e65d36bdb00517c592506aee4c4a8a9e7628f862d6c881a&=&format=webp&width=701&height=701"
              alt="Movie"
            />
          </figure>
          <div class="card-body lg:w-96 text-white">
            <h2 class="card-title">
              <img src="../../public/quote.png" width="82" height="82" alt="" srcset="" />
            </h2>
            <p>
              Hi, let me introduce myself <br />
              My name is Fery im a IT guy, i can do :
              <li>Web Programming</li>
              <li>IT Infrastructure</li>
              <li>Drone Pilot</li>
            </p>
            <div class="card-actions justify-start">
              <div class="bg-white text-black font-bold p-2 w-24 text-center rounded-full">
                Fery P
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card card-compact bg-base-100 w-96 shadow-xl">
        <figure>
          <img
            src="https://media.discordapp.net/attachments/1164452737262551050/1284174952479854704/1726241545340.jpg?ex=677b4edf&is=6779fd5f&hm=332fa634f3e87cdabcf17581967c1e47954489b186fdadda9294529a6ab4ea02&=&format=webp&width=561&height=701"
            alt="Shoes"
          />
        </figure>
        <div class="card-body">
          <h2 class="card-title">Lorem</h2>
          <p>Menuju Tak Terbatas dan Melampauinya</p>
          <div class="card-actions justify-end"></div>
        </div>
      </div>
    </div>
    <div class="flex space-x-3">
      <div class="card bg-white w-96 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Card title!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div class="card-actions justify-end"></div>
        </div>
      </div>
      <div
        class="hero h-64 bg-cover bg-center bg-no-repeat"
        style="
          background-image: url(https://media.discordapp.net/attachments/1164452737262551050/1325513011548520558/1736084585632.jpg?ex=677c0fb0&is=677abe30&hm=5c1e1967a17c2dd8ae155346ca93ffc384e0ed693ec90369b926afa53100ae6d&=&format=webp&width=1052&height=701);
        "
      >
        <div class="hero-overlay"></div>
        <div class="hero-content text-neutral-content text-center">
          <div class="max-w-md">
            <h1 class="mb-5 text-5xl font-bold">Hello there</h1>
            <p class="mb-5"></p>
          </div>
        </div>
      </div>
      <div class="card bg-white w-96 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Card title!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div class="card-actions justify-end"></div>
        </div>
      </div>
    </div>
  </section>
</template>
<style>
.card.image-full > figure img {
  object-position: 170px 30px;
  object-fit: contain;
}
.card.image-full:before {
  content: none;
}
.hero-overlay {
  background-color: none !important;
  --tw-bg-opacity: 0;
}
</style>
