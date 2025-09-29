export default function Profile() {
  return /*html*/ `
    <div class="profile">
      <div class="container">
        <!-- Left section -->
        <div class="left">
          <div class="avatar"><img src="./assets/fotoku.jpeg"/></div>
          <div class="info">
            <h2>Gilbran Mahda</h2>
            <p>Teknik Informarika ITS - 2024</p>
            <p>Surabaya, Indonesia</p>
            <p>gilmavira@email.com</p>
          </div>
          <div class="sosmed">
            <a href="https://www.instagram.com/gbrn.mhd/" target="_blank"><img src="./assets/instagram.png" alt="Instagram"/><p>@gbrn.mhd</p></a>
            <a href="https://www.linkedin.com/in/gilbran-mahda/" target="_blank"><img src="./assets/linkedin.png" alt="LinkedIn"/><p>gilbran-mahda</p></a>
            <a href="https://github.com/mamahda" target="_blank"><img src="./assets/github.png" alt="GitHub"/><p>mamahda</p></a>
          </div>
        </div>

        <!-- Right section -->
        <div class="right">
          <div class="card welcome">
            <h2>About Me</h2>
            <p>Enthusiastic student with a strong interest in computer science and engineering. Currently honing my skills in competitive programming and exploring the field of Machine Learning. Eager to apply my knowledge and skills to challenging projects and contribute to the advancement of technology.</p>
          </div>

          <div class="card experience">
            <h2>Experience</h2>
            <div class="timeline">

              <!-- PAMMITS -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Staff Tenant Specialist - PAMMITS 2025</h3>
                  <p class="date">Surabaya, Jawa Timur | Aug 2025 - Present</p>
                  <p>
                    Pasar Malam Minggu ITS (PAMMIT) is a two-day night market for the ITS community, featuring entrepreneurial tenants, live music, and social spaces.
                  </p>
                </div>
              </div>

              <!-- IEEE -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Strategy and Growth Officer - IEEE ITS SB</h3>
                  <p class="date">Surabaya, Jawa Timur | May 2025 - Present</p>
                  <ul>
                    <li>Managed Instagram with 3.7k followers.</li>
                    <li>Built engagement through comments, DMs, and interactive features.</li>
                    <li>Planned content and schedules for events and branding.</li>
                  </ul>
                </div>
              </div>

              <!-- Schematics -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Staff Branding and Marketing - Schematics 2025</h3>
                  <p class="date">Surabaya, Jawa Timur | Mar 2025 - Present</p>
                  <ul>
                    <li>Managed multi-platform accounts with 17k+ followers.</li>
                    <li>Achieved 400k+ reels views in 30 days.</li>
                    <li>Designed content plans and posting timelines.</li>
                  </ul>
                </div>
              </div>

              <!-- Gerigi -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Staff Secretarial - Gerigi X UKM Expo ITS 2025</h3>
                  <p class="date">Surabaya, Jawa Timur | Jul 2025 - Aug 2025</p>
                  <ul>
                    <li>Monitored attendance and managed information flow for 18 freshmen.</li>
                    <li>Assisted mentors in facilitating discussions and ensuring smooth sessions.</li>
                    <li>Guided and maintained discipline of freshmen throughout activities.</li>
                  </ul>
                </div>
              </div>

              <!-- OKKBK -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Staff Kakak Pembimbing - OKKBK HMTC 2025</h3>
                  <p class="date">Surabaya, Jawa Timur | Jul 2025 - Aug 2025</p>
                  <ul>
                    <li>Monitored attendance and managed information flow for 10 freshmen.</li>
                    <li>Facilitated discussions and ensured smooth session flow.</li>
                    <li>Guided and maintained discipline of freshmen during activities.</li>
                  </ul>
                </div>
              </div>

              <!-- Ini Lho ITS -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Staff Media Creative - Ini Lho ITS X Wengker ITS 2025</h3>
                  <p class="date">Ponorogo | Nov 2024 - Feb 2025</p>
                  <ul>
                    <li>Captured key moments from 3 high schools and 2 vocational school visits.</li>
                    <li>Documented Welcome Event with 153 students.</li>
                    <li>Produced high-quality photos/videos with 30,000+ Instagram views.</li>
                  </ul>
                </div>
              </div>
               
              <!-- IRIS ITS -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Programming Intern - IRIS ITS</h3>
                  <p class="date">Surabaya, Jawa Timur | Aug 2024 - Oct 2024</p>
                  <p>
                    IRIS ITS is the robotics team of Institut Teknologi Sepuluh Nopember (ITS), specializing in wheel-based soccer robots.
                  </p>
                  <ul>
                    <li>Learned fundamentals and techniques of Competitive Programming.</li>
                    <li>Explored basics of Computer Vision and implemented projects using OpenCV.</li>
                    <li>Hands-on experience in Robot Operating System (ROS).</li>
                    <li>Strengthened problem-solving skills through coding challenges.</li>
                  </ul>
                </div>
              </div>

              <!-- FRI -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Coordinator Documentation - Festival Remaja Islam (FRI) X 2023</h3>
                  <p class="date">Ponorogo, Jawa Timur | Nov 2022 - Feb 2023</p>
                  <ul>
                    <li>Led a team of 4 staff for documentation.</li>
                    <li>Covered full 7-hour event with smooth task delegation.</li>
                    <li>Captured storytelling-oriented shots of 100+ participants.</li>
                  </ul>
                </div>
              </div>

              <!-- Final Night -->
              <div class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <h3>Staff Documentation - Final Night 2023</h3>
                  <p class="date">Ponorogo, Jawa Timur | Mar 2023 - May 2023</p>
                  <ul>
                    <li>Produced 8 event videos with a 5-person team.</li>
                    <li>Captured 5+ hours of BTS and live event footage using mirrorless cameras.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
