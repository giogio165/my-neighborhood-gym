var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.5759, 126.9768), // 지도의 중심좌표
        level: 5 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);


// 더미데이터
const dataSet = [
    {
        title: "자마이카 휘트니스",
        address: "서울 관악구 신림로 340 르네상스쇼핑몰 12층",
        url: "https://youtu.be/_2kvaX-5aMs",
        category: "관악구",
		price: "0"+"원"
    },
    {
        title: "짐박스피트니스 봉천점",
        address: "봉천동 895-18",
        url: "https://www.youtube.com/watch?v=R9ynJyAz1K0",
        category: "관악구",
		price: "15,000"+"원"
    },
    {
        title: "다가짐",
        address: "구로동 604-19",
        url: "https://www.youtube.com/watch?v=JGX16sbDu1k",
        category: "구로구",
		price: "20,000"+"원"
    }
  ];

// --- 더미 데이터 ---

// 3. 여러개의 마커  찍기

	// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();
function getContent(data){
	// 썸네일 따오기
	let replaceUrl = data.url;
	let finUrl = "";
	replaceUrl = replaceUrl.replace("https://youtu.be/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
	finUrl = replaceUrl.split("&")[0];
	// 인포윈도우 가공하기
	return `
	<div class = "infowindow">
		<div class = "infowindow-img-container">
			<img
				src = "https://img.youtube.com/vi/${finUrl}/sddefault.jpg"
				class = "infowindow-img"></img>
		</div>
		<div class = "infowindow-body">
			<h5 class = "infowindow-title">${data.title}</h5>
			<p class = "infowindow-address">${data.address}</p>
			<a href = "${data.url}" class = "infowindow-btn" target ="_blank">영상이동</a>
		</div>
	</div>
	`;
}

async function setMap(dataSet) {
	for (var i = 0; i < dataSet.length; i++) {
	  let position = await getCoordsByAddress(dataSet[i].address);
  
	  // 마커를 생성합니다
	  var marker = new kakao.maps.Marker({
		map: map, // 마커를 표시할 지도
		position: position, // 마커를 표시할 위치
	  });

	  markerArray.push(marker);
  
	  // 마커에 표시할 인포윈도우를 생성합니다
	  var infowindow = new kakao.maps.InfoWindow({
		content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
		disableAutoPan: true, // 인포윈도우를 열 때 지도가 자동으로 패닝하지 않을지의 여부 (기본값: false)
	  });
  
	  infowindowArray.push(infowindow);
  
	  // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
	  // 이벤트 리스너로는 클로저를 만들어 등록합니다
	  // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
	  kakao.maps.event.addListener(
		marker,
		"click",
		makeOverListener(map, marker, infowindow, position)
	  );
	  // 커스텀: 맵을 클릭하면 현재 나타난 인포윈도우가 없어지게끔
	  kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
	}
  }
  
  
  function makeOverListener(map, marker, infowindow, position) {
	return function () {
	  // 1. 클릭시 다른 인포윈도우 닫기
	  closeInfowindow();
	  infowindow.open(map, marker);
	  // 2. 클릭한 곳으로 짇 중심 이동하기
	  map.panTo(position);
	};
  }
  
  // 커스텀
  // 1. 클릭시 다른 인포윈도우 닫기
  let infowindowArray = [];
  function closeInfowindow() {
	for (let infowindow of infowindowArray) {
	  infowindow.close();
	}
  }
  
  // 인포윈도우를 닫는 클로저를 만드는 함수입니다
  function makeOutListener(infowindow) {
	return function () {
	  infowindow.close();
	};
  }


function getCoordsByAddress(address){
	return new Promise((reslove,reject)=>{
		// 주소로 좌표를 검색합니다
		geocoder.addressSearch(address, function(result, status) {

			// 정상적으로 검색이 완료됐으면 
			if (status === kakao.maps.services.Status.OK) {

				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);   
				reslove(coords)
				return;
			} 
			reject(new Error("getCoordsByAddress Error: not Valid Address"));
		});    
	})
}

setMap(dataSet);

// 카테고리 객체 만들기
const categoryMap ={
	gurogu: "구로구",
	gwanakgu: "관악구",
}

const categoryCity = document.querySelector(".category-city");
categoryCity.addEventListener("click", categoryHandler);

function categoryHandler(event){
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];


	//데이터 분류
	let categorizedDataSet = [];
	for (let data of dataSet){
		if (data.category === category){
			categorizedDataSet.push(data);
		}
	}
	//기존 마커 삭제
	closeMarker();
	//기존 인포윈도우 닫기
	closeInfowindow();
	setMap(categorizedDataSet);
}

let markerArray = [];
function closeMarker(){
	for ( marker of markerArray){
		marker.setMap(null);
	}
}
