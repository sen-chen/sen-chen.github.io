$(document).ready(function(){

	/*================
	 Menu
     bootstrapÄ£°å¿â£ºHttP://www.bootstrapmb.com
	==================*/

	$('.menu-item-has-children a').click(function(){
		$(this).siblings('.sub-menu').slideToggle();
	});

	$('.menu-toggle').click(function(){
		$(this).toggleClass('show');
		$(this).siblings('nav').slideToggle();
	})

	// Sticky Menu

	var headers1 = $('.site-header');
	$(window).on('scroll', function () {

		if ($(window).scrollTop() > 200) {
			headers1.addClass('sticky');
		} else {
			headers1.removeClass('sticky');
		}

	});

	/*================
	 Portfolio
	==================*/

	$(".portfolio-carousel").owlCarousel({
		items: 4,
		loop:true,
		margin:30,
		dots:true,
		responsive: {
			0: {
				items: 1
			},
			520: {
				items: 2
			},
			768: {
				items: 2
			},
			992: {
				items: 3
			},
			1200: {
				items: 4
			},
			1920: {
				items: 4,
			}
		}
	});

	/*================
	 Testimonial
	==================*/

	$(".testimonial-carousel").owlCarousel({
		loop:true,
		margin:30,
		dots:true,
		responsive: {
			0: {
				items: 1
			},
			768: {
				items: 2
			},
			992: {
				items: 3
			},
			1920: {
				items: 3,
			}
		}
	});

	$(".about-testimonial-carousel").owlCarousel({
		items: 1,
		loop:true,
		dots:true,
	});

	/*================
	 Accordion
	==================*/
	
	$('.accordion > li:eq(0) a').addClass('active').next().slideDown();

	$('.accordion a').click(function(j) {
		var dropDown = $(this).closest('li').find('p');

		$(this).closest('.accordion').find('p').not(dropDown).slideUp();

		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
		} else {
			$(this).closest('.accordion').find('a.active').removeClass('active');
			$(this).addClass('active');
		}

		dropDown.stop(false, true).slideToggle();

		j.preventDefault();
	});

	/*================
	 Search Popup
	==================*/

  if($('.search-icon').length) {
  	$('.search-icon').on('click', function() {
  		$('body').addClass('search-active');
  	});
  	$('.close-search').on('click', function() {
  		$('body').removeClass('search-active');
  	});
  }

	/*================
	 Counter
	==================*/

	var counted = 0;
	$(window).scroll(function() {

		var oTop = $('#counter').offset().top - window.innerHeight;
		if (counted == 0 && $(window).scrollTop() > oTop) {
			$('.count').each(function() {
				var $this = $(this),
				countTo = $this.attr('data-count');
				$({
					countNum: $this.text()
				}).animate({
					countNum: countTo
				},

				{

					duration: 2000,
					easing: 'swing',
					step: function() {
						$this.text(Math.floor(this.countNum));
					},
					complete: function() {
						$this.text(this.countNum);
					}

				});
			});
			counted = 1;
		}

	});

	/*================
	 Portfolio Page
	==================*/

  $('.portfolio-item').isotope(function(){
    itemSelector:'.item'
  });

  $('.portfolio-menu ul li').click(function(){
    $('.portfolio-menu ul li').removeClass('active');
    $(this).addClass('active');

    var selector = $(this).attr('data-filter');
      $('.portfolio-item').isotope({
        filter: selector
      })
      return false;
  });
  

});