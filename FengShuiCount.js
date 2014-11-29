$(function() {
//basic listeners
	$("button#addFeatFoe").on("click", function(){
	    addFeatFoe();
	});
	$("button#addMook").on("click", function(){
    	    addMook();
    });
	$("button#resetShots").on("click", function(){
	    $("input#seqCounter").val(parseInt($("input#seqCounter").val()) + 1);
	    var maxShot = 0;
        $("table#foe_table tbody tr").each(function(){
            var speed = parseInt($(this).find(".speed").val());
            var startingShot = speed + dice();
            if(startingShot>maxShot){
                maxShot = startingShot;
            }
            $(this).find(".shots").val(startingShot);
        });
        $("input#shotCounter").val(maxShot).trigger('change');
    });
	$("table#foe_table").on("click", "button.delete",function(){
    	$( this ).parent().parent().remove();
    });
	$("table#foe_table").on("click", "button.roll",function(){
    	var foeLine = $( this ).parent().parent();

    	var foeShots = parseInt(foeLine.find(".shots").val()) - 3 ;
    	if (foeShots < 0) {
    	    foeShots = 0;
    	}
    	foeLine.find(".shots").val(foeShots).trigger('change');

    	var mainAV = parseInt(foeLine.find(".mainAV").val());
    	var secondAV = parseInt(foeLine.find(".secondAV").val());
    	if (foeLine.hasClass("featFoe")){
    	    rollFoe(foeLine, mainAV, secondAV);
    	} else {
    	    var number = parseInt(foeLine.find(".many").val());
    	    rollMook(foeLine, mainAV, secondAV, number);
    	}
    });
    $('body').on('change','input#shotCounter, input.shots',function(){
        var currentShot = parseInt($('input#shotCounter').val());
        $('table#foe_table tr').each(function(){
            var ownShot = parseInt($(this).find('input.shots').val());
            if(ownShot < currentShot){
                $(this).removeClass('alert-success').removeClass('alert-danger');
            } else if (ownShot == currentShot){
                $(this).removeClass('alert-danger').addClass('alert-success');
            } else if (ownShot > currentShot){
                $(this).removeClass('alert-success').addClass('alert-danger');
            }
        });
    });
    $('input#shotCounter').on('change', function(){sortFoes();});

//specific functions
    function addFeatFoe(){
        var newFoeContent = '<tr class="featFoe"><td>Name: <input class="name" type="text" value="New Foe"/></td>';
        newFoeContent = newFoeContent + '<td>Shot: <input class="shots" type="number" value="0"/></td>'
        newFoeContent = newFoeContent + '<td>Wounds: <input class="wounds" type="number" value="0"/></td>'
        newFoeContent = newFoeContent + '<td>Main AV: <input class="mainAV" type="number" value="13"/></td>'
        newFoeContent = newFoeContent + '<td>Defense: <input class="def" type="number" value="13"/></td>'
        newFoeContent = newFoeContent + '<td>Secondary AV: <input class="secondAV" type="number" value="0"/></td>'
        newFoeContent = newFoeContent + '<td>Toughness: <input type="number" value="7"/></td>'
        newFoeContent = newFoeContent + '<td>Speed: <input class="speed" type="number" value="7"/></td>'
        newFoeContent = newFoeContent + '<td><button class="roll">Roll</button></td>'
        newFoeContent = newFoeContent + '<td><button class="delete"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></button></td>'
        newFoeContent = newFoeContent + "</tr>"
        $("#foe_table").append(newFoeContent);
    }
    function addMook(){
        var newFoeContent = '<tr class="mook"><td>Name: <input class="name" type="text" value="New Mooks"/></td>';
        newFoeContent = newFoeContent + '<td>Shot: <input class="shots" type="number" value="0"/></td>'
        newFoeContent = newFoeContent + '<td>Number: <input class="many" type="number" value="10"/></td>'
        newFoeContent = newFoeContent + '<td>Main AV: <input class="mainAV" type="number" value="8"/></td>'
        newFoeContent = newFoeContent + '<td>Defense: <input class="def" type="number" value="13"/></td>'
        newFoeContent = newFoeContent + '<td>Secondary AV: <input class="secondAV" type="number" value="0"/></td>'
        newFoeContent = newFoeContent + '<td>Speed: <input class="speed" type="number" value="5"/></td>'
        newFoeContent = newFoeContent + '<td>Group rolls <input type="checkbox" class="mookGroup" value="1"/></td>'
        newFoeContent = newFoeContent + '<td><button class="roll">Roll</button></td>'
        newFoeContent = newFoeContent + '<td><button class="delete"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></button></td>'
        newFoeContent = newFoeContent + "</tr>"
        $("#foe_table").append(newFoeContent);
    }

    function rollFoe(foeLine, mainAV, secondAV){
    	var mainRoll = FSRoll(mainAV);
    	var secondRoll = FSRoll(secondAV);
    	var contentModal = foeLine.find(".name").val() + " has rolled : <em>" + mainRoll
    	contentModal = contentModal + "</em> for its main AV, and <em>" + secondAV + "</em> for its secondary AV";
    	$('#popupModal').html(contentModal);
        $('#myModal').modal('show');
    }
    function rollMook(foeLine, mainAV, secondAV, number){
        var group = foeLine.find(".mookGroup").is(":checked");
        var contentModal = '..';
        if(group){
            var mainRoll = FSRoll(mainAV + number);
            var secondRoll = FSRoll(secondAV + number);
            contentModal = foeLine.find(".name").val() + " has rolled : <em>" + mainRoll
            contentModal = contentModal + "</em> for its main AV, and <em>" + secondAV + "</em> for its secondary AV";
        } else {
            var results = [];
            for (i = 0; i < number; i++) {
                results.push(FSRoll(mainAV));
            }
            results.sort(function(a, b){return b-a});
            var showResult = "[ " + results.join(", ") + " ]";
            contentModal = foeLine.find(".name").val() + " have rolled the following values <em>" + showResult + "</em>";
            contentModal = contentModal + "<br> Summary: <br>" + aggregateArray(results);
        }
        $('#popupModal').html(contentModal);
        $('#myModal').modal('show');
    }

//dice utils
    function dice(){
        return Math.floor(6*Math.random()+1);
    }
    function FSRoll(AV){
        var pos = dice();
        while (pos % 6 == 0){
            pos = pos + dice();
        }
        var neg = dice();
        while (neg % 6 == 0){
            neg = neg + dice();
        }
        return pos - neg + AV;
    }

//other utils
    function aggregateArray(sortedArray){
        var aggregatedArray = [];
        var countedVal = sortedArray[0];
        var occurence = 0;
        for (i = 0; i < sortedArray.length; i++) {
            if(countedVal !== sortedArray[i]){
                aggregatedArray.push([countedVal, occurence]);
                countedVal = sortedArray[i];
                occurence = 1;
            } else {
                occurence += 1;
            }
        }
        aggregatedArray.push([countedVal, occurence]);
        var htmlArray = '<table class="table table-condensed"><tr><th>Score</th><th>Number of roll</th></tr>'
        for (i = 0; i < aggregatedArray.length; i++) {
            htmlArray = htmlArray + "<tr><td>"+aggregatedArray[i][0]+"</td><td>"+aggregatedArray[i][1]+"</td></tr>";
        }
        htmlArray = htmlArray + "</table>";
        return htmlArray;
    }

    function sortFoes(){
        var finished = false;
        var currentFoe;
        var destFoe;
        while(!finished){
            finished = true;
            $('table#foe_table tr').each(function(){
                currentFoe = $(this);
                destFoe = currentFoe.next();
                while(destFoe.length>=1){
                    if(compareFoes(currentFoe, destFoe)==-1){
                        currentFoe.insertAfter(destFoe);
                        finished = false;
                    }
                    destFoe = destFoe.next();
                }
            });
        }
        //$('table#foe_table tr').first().insertAfter($('table#foe_table tr').last());
    }

    function compareFoes(firstFoe, secondFoe){
        var firstShot = parseInt(firstFoe.find('input.shots').val());
        var secondShot = parseInt(secondFoe.find('input.shots').val());
        if(firstShot < secondShot){
            return -1;
        } else if (firstShot > secondShot){
            return 1;
        }
        return 0;
    }
});


