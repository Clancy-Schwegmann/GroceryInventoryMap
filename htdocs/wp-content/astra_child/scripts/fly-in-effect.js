jQuery(document).ready(function($) {
    //find specific classes
    const fly_in_group = document.querySelectorAll(".fly-in-right, .fly-in-left");
    //check if user has scrolled to view items
    const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        //update sub-classes
    if (entry.isIntersecting) 
    {
      entry.target.classList.remove("hidden");
      entry.target.classList.add("visible");
    } 
    else //if we're exiting the view of the element, then we hide it
    {
      entry.target.classList.remove("visible");
      entry.target.classList.add("hidden");
    }
    });
    }, {
    threshold: 0.3
    });
    
    //observe each item in the group.
    fly_in_group.forEach(flyIn => observer.observe(flyIn));
});