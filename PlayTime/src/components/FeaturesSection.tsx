/*

import React from 'react';
import FeatureCard from './FeatureCard';
import '../styles/FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 1,
      title: '사용자 채팅방',
      description: '유저들간의 24시간 영화 감상 채팅 서비스를 제공',
      buttonText: '바로가기',
    },
    {
      id: 2,
      title: '소통 커뮤니티',
      description: '영화 감상평을 남길 수 있는 커뮤니티를 제공',
      buttonText: '바로가기',
    },
    {
      id: 3,
      title: '영화 시청 시간 타이머',
      description: '시청한 영화 시간을 체크하고 순위를 제공',
      buttonText: '바로가기',
    },
  ];

  return (
    <section className="features-section">
      <div className="features-grid">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            buttonText={feature.buttonText}
            onButtonClick={() => console.log(`${feature.title} 클릭`)}
          />
        ))}
      </div>
      <div className="features-divider"></div>
      <p className="features-tagline">
        단순 영화 추천을 넘어 다양한 사람들과 시청한 영화를 추천하고 추천받을 수 있는 서비스
      </p>
    </section>
  );
};

export default FeaturesSection;
*/

// import React from 'react';
// import FeatureCard from './FeatureCard';
// import '../styles/FeaturesSection.css';

// const FeaturesSection: React.FC = () => {
//   const features = [
//     {
//       id: 1,
//       title: '사용자 채팅방',
//       description: '유저들간의 24시간 영화 감상 채팅 서비스를 제공',
//       buttonText: '바로가기',
//     },
//     {
//       id: 2,
//       title: '소통 커뮤니티',
//       description: '영화 감상평을 남길 수 있는 커뮤니티를 제공',
//       buttonText: '바로가기',
//     },
//     {
//       id: 3,
//       title: '영화 시청 시간 타이머',
//       description: '시청한 영화 시간을 체크하고 순위를 제공',
//       buttonText: '바로가기',
//     },
//   ];

//   return (
//     <section className="features-section">
//       <div className="features-grid">
//         {features.map((feature) => (
//           <FeatureCard
//             key={feature.id}
//             title={feature.title}
//             description={feature.description}
//             buttonText={feature.buttonText}
//             onButtonClick={() => console.log(`${feature.title} 클릭`)}
//           />
//         ))}
//       </div>

//       <div className="features-divider"></div>

//       {/* ✅ Movie Point 반투명 박스 */}
//       <div
//         style={{
//           width: 367,
//           height: 64,
//           margin: '0 auto',
//           background: 'rgba(39, 39, 39, 0.3)',
//           borderRadius: 50,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           opacity: 0.7,
//         }}
//       >
//         <span
//           style={{
//             textAlign: 'center',
//             color: 'white',
//             fontSize: 20,
//             fontFamily: 'DM Sans',
//             fontWeight: 600,
//             lineHeight: '20px',
//           }}
//         >
//           Movie Point
//         </span>
//       </div>

//       {/* ✅ 문장 (32px 간격 유지) */}
//       <p
//         className="features-tagline"
//         style={{
//           marginTop: -32, // Movie Point와의 간격 정확히 32px
//         }}
//       >
//         단순 영화 추천을 넘어 다양한 사람들과 시청한 영화를 추천하고 추천받을 수 있는 서비스
//       </p>

//       {/* ✅ 문장 아래 50px 간격 반투명 박스 */}
//       <div
//         style={{
//           width: 1647,
//           height: 734,
//           background: 'rgba(255, 255, 255, 0.20)',
//           borderRadius: 17,
//           margin: '-25px auto 0',
//         }}
//       />
//     </section>
//   );
// };

// export default FeaturesSection;

import React from 'react';
import FeatureCard from './FeatureCard';
import '../styles/FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 1,
      title: '사용자 채팅방',
      description: '유저들간의 24시간 영화 감상 채팅 서비스를 제공',
      buttonText: '바로가기',
    },
    {
      id: 2,
      title: '소통 커뮤니티',
      description: '영화 감상평을 남길 수 있는 커뮤니티를 제공',
      buttonText: '바로가기',
    },
    {
      id: 3,
      title: '영화 시청 시간 타이머',
      description: '시청한 영화 시간을 체크하고 순위를 제공',
      buttonText: '바로가기',
    },
  ];

  return (
    <section className="features-section">
      <div className="features-grid">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            buttonText={feature.buttonText}
            onButtonClick={() => console.log(`${feature.title} 클릭`)}
          />
        ))}
      </div>

      <div className="features-divider"></div>

      {/* ✅ Movie Point 반투명 박스 */}
      <div
        style={{
          width: 367,
          height: 64,
          margin: '0 auto',
          background: 'rgba(39, 39, 39, 0.3)',
          borderRadius: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
        }}
      >
        <span
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 20,
            fontFamily: 'DM Sans',
            fontWeight: 600,
            lineHeight: '20px',
          }}
        >
          Movie Point
        </span>
      </div>

      {/* ✅ 문장 (32px 간격 유지) */}
      <p
        className="features-tagline"
        style={{
          marginTop: -32, // Movie Point와의 간격 정확히 32px
        }}
      >
        단순 영화 추천을 넘어 다양한 사람들과 시청한 영화를 추천하고 추천받을 수 있는 서비스
      </p>

      {/* ✅ 문장 아래 50px 간격 반투명 박스 */}
      <div
        style={{
          width: 1647,
          height: 734,
          background: 'rgba(255, 255, 255, 0.20)',
          borderRadius: 17,
          margin: '-25px auto 120px', // ✅ 아래쪽 50px 공백 추가
        }}
      />
    </section>
  );
};

export default FeaturesSection;
