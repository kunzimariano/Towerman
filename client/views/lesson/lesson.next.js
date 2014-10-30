function getLesson() {
  return Lessons.findOne({_id:'variables'});
}

Template.lesson.helpers({
  lesson: getLesson
});

Template.lesson.events({
  'click .challengeShow': function() {
    $('.lesson').hide();
    $('.challenge').show();
  }
});

Template.question.rendered = function() {
  $('.choice').button();
}

Template.question.events({
  'click .check': function() {
    var val = $('.question .btn-group .btn[class*="active"] input').val();
    if (val) {
      var index = parseInt(val);
      var correct = this.correctIndex == parseInt(index);
      var icon = correct ? 'fa fa-check' : 'fa fa-ban';
      var bg = correct ? 'seagreen' : 'indianred';
      $('.feedback').html(`<div style='padding: 4px; color: white; background-color: ${bg}'><span class='${icon}'></span>&nbsp;` + this.choices[index].feedback + '</div>');
      $('.feedback').hide();
      $('.feedback').fadeIn('slow');
    }
  }
});

Template.steps.helpers({
    lesson: getLesson
});

Template.step.helpers({
  previousAllowed: function() {
    return this.index > 0;
  },
  nextAllowed: function() {
    return this.index < getLesson().steps.length - 1;
  },
  pager: function() {
    return {current: this.index + 1, total: getLesson().steps.length};
  }
});

function lessonNavigate(currentIndex, newIndex, attemptedCurrent) {
    $('.explanation').hide();
    var lesson = getLesson();
    lesson.steps[currentIndex].current = false;
    if (attemptedCurrent) lesson.steps[currentIndex].attempted = true;
    lesson.steps[newIndex].current = true;
    var id = lesson._id;
    delete lesson._id;
    Lessons._collection.update({_id: id}, {$set: lesson});  
}

function feedbackInsert(step, sense) {
    var feedback = {
      lessonStepName: step.name,
      lessonStepTitle: step.title,
      userId: Meteor.userId(),
      date: new Date(),
      sense
    };
    StepFeedback.insert(feedback);
}

Template.step.events({
  'click .explanationShow': function() {
    $('.explanation').show();
  },
  'click .previous': function() {
    lessonNavigate(this.index, this.index - 1, false);
  },
  'click .next': function() {
    lessonNavigate(this.index, this.index + 1, true);
  },
  'click .not': function() {
    feedbackInsert(this, 'not');
  },
  'click .almost': function() {
    feedbackInsert(this, 'almost');
  },
  'click .yes': function() {
    feedbackInsert(this, 'yes');
  }  
});