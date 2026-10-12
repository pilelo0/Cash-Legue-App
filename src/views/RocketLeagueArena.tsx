import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Score {
  player: number;
  rival: number;
}

export default function RocketLeagueArena() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState<Score>({ player: 0, rival: 0 });
  const [gameStatus, setGameStatus] = useState('Arena 3D Activa - ¡Anota en el arco!');
  const scoreRef = useRef<Score>({ player: 0, rival: 0 });
  const statusRef = useRef(gameStatus);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070709);
    scene.fog = new THREE.Fog(0x070709, 40, 80);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffc700, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x00e676, 0.4);
    dirLight2.position.set(-10, 15, -10);
    scene.add(dirLight2);

    const fieldGeo = new THREE.PlaneGeometry(30, 50);
    const fieldMat = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.4, metalness: 0.3 });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    scene.add(field);

    const lineGeo = new THREE.PlaneGeometry(0.3, 50);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.3 });
    for (let i = -2; i <= 2; i++) {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i * 5, 0.02, 0);
      scene.add(line);
    }
    const centerLineGeo = new THREE.PlaneGeometry(30, 0.3);
    const centerLine = new THREE.Mesh(centerLineGeo, lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.02, 0);
    scene.add(centerLine);

    const borderGeo = new THREE.BoxGeometry(31, 1, 51);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.5 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = 0.5;
    scene.add(border);

    const goalGeo = new THREE.BoxGeometry(8, 4, 0.3);
    const playerGoalMat = new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x003311, transparent: true, opacity: 0.6 });
    const rivalGoalMat = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0x331111, transparent: true, opacity: 0.6 });
    const playerGoal = new THREE.Mesh(goalGeo, playerGoalMat);
    playerGoal.position.set(0, 2, -25);
    scene.add(playerGoal);
    const rivalGoal = new THREE.Mesh(goalGeo, rivalGoalMat);
    rivalGoal.position.set(0, 2, 25);
    scene.add(rivalGoal);

    const carGroup = new THREE.Group();
    const carBodyGeo = new THREE.BoxGeometry(2, 1, 3.5);
    const carBodyMat = new THREE.MeshStandardMaterial({ color: 0x00e676, metalness: 0.6, roughness: 0.3 });
    const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
    carBody.position.y = 0.75;
    carGroup.add(carBody);

    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const wheelPositions: [number, number, number][] = [
      [-1.2, 0.3, 1.2], [1.2, 0.3, 1.2], [-1.2, 0.3, -1.2], [1.2, 0.3, -1.2],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      carGroup.add(wheel);
    });

    carGroup.position.set(0, 0, 15);
    scene.add(carGroup);

    const ballGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffc700, emissive: 0x332200, metalness: 0.8, roughness: 0.2 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 1.8, 0);
    scene.add(ball);

    const ballGlow = new THREE.PointLight(0xffc700, 1.5, 15);
    ballGlow.position.copy(ball.position);
    scene.add(ballGlow);

    let ballVelocity = new THREE.Vector3();
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      keys[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const moveSpeed = 0.3;
      const turnSpeed = 0.05;

      if (keys['ArrowUp'] || keys['w']) carGroup.translateZ(-moveSpeed);
      if (keys['ArrowDown'] || keys['s']) carGroup.translateZ(moveSpeed);
      if (keys['ArrowLeft'] || keys['a']) carGroup.rotation.y += turnSpeed;
      if (keys['ArrowRight'] || keys['d']) carGroup.rotation.y -= turnSpeed;

      carGroup.position.x = Math.max(-14, Math.min(14, carGroup.position.x));
      carGroup.position.z = Math.max(-23, Math.min(23, carGroup.position.z));

      const distance = carGroup.position.distanceTo(ball.position);
      if (distance < 3.2) {
        const pushDir = new THREE.Vector3().subVectors(ball.position, carGroup.position).normalize();
        ballVelocity.addScaledVector(pushDir, 0.45);
      }

      ball.position.add(ballVelocity);
      ballVelocity.multiplyScalar(0.96);
      ballGlow.position.copy(ball.position);

      if (Math.abs(ball.position.x) > 13.5) {
        ballVelocity.x *= -0.8;
        ball.position.x = Math.sign(ball.position.x) * 13.5;
      }

      if (ball.position.z < -24) {
        scoreRef.current = { ...scoreRef.current, player: scoreRef.current.player + 1 };
        setScore(scoreRef.current);
        statusRef.current = '¡GOOOOOOL DE GOLDENACE! ⚽';
        setGameStatus(statusRef.current);
        ball.position.set(0, 1.8, 0);
        ballVelocity.set(0, 0, 0);
        carGroup.position.set(0, 0, 15);
        setTimeout(() => {
          statusRef.current = 'Arena 3D Activa - ¡Anota en el arco!';
          setGameStatus(statusRef.current);
        }, 2000);
      }

      if (ball.position.z > 24) {
        scoreRef.current = { ...scoreRef.current, rival: scoreRef.current.rival + 1 };
        setScore(scoreRef.current);
        statusRef.current = 'Gol de Viper_CL... ¡Sigue intentando!';
        setGameStatus(statusRef.current);
        ball.position.set(0, 1.8, 0);
        ballVelocity.set(0, 0, 0);
        carGroup.position.set(0, 0, 15);
        setTimeout(() => {
          statusRef.current = 'Arena 3D Activa - ¡Anota en el arco!';
          setGameStatus(statusRef.current);
        }, 2000);
      }

      ball.position.z = Math.max(-25, Math.min(25, ball.position.z));

      camera.position.x = carGroup.position.x * 0.5;
      camera.position.z = carGroup.position.z + 18;
      camera.lookAt(carGroup.position.x * 0.3, 2, carGroup.position.z * 0.3);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (mount) mount.innerHTML = '';
      renderer.dispose();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-[#14141c] border-2 border-[#ffc700] p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div>
          <span className="text-xs text-gray-400 font-bold block">JUGADOR</span>
          <span className="text-lg font-black text-[#00e676]">GoldenAce (TU)</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#ffc700] font-black uppercase tracking-widest">{gameStatus}</p>
          <div className="text-2xl font-black text-white mt-1">{score.player} - {score.rival}</div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-bold block">RIVAL</span>
          <span className="text-lg font-black text-red-500">Viper_CL</span>
        </div>
      </div>

      <div
        ref={mountRef}
        className="w-full h-[480px] rounded-2xl overflow-hidden border-2 border-[#ffc700]/50 shadow-2xl relative"
      >
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#ffc700] text-[11px] text-[#ffc700] font-bold z-10">
          🎮 Controles: W, A, S, D o Flechas para Conducir y Meter Gol
        </div>
      </div>
    </div>
  );
}
